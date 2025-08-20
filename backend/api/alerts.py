from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

# Import timezone utilities
from utils.timezone import get_ist_datetime_for_db, now_ist

from database.connection import get_db
from database.models import User, Alert, MonitoringSession, AlertStatistics
from auth.security import get_current_active_user
from models.alert import AlertCreate, AlertResponse, AlertAnalytics, SessionResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.post("/store", response_model=AlertResponse)
async def store_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> AlertResponse:
    """Store a new alert"""
    # Find or create active session
    active_session = db.query(MonitoringSession).filter(
        and_(
            MonitoringSession.user_id == current_user.id,
            MonitoringSession.end_time == None
        )
    ).first()
    
    if not active_session:
        # Create new session if none exists
        active_session = MonitoringSession(user_id=current_user.id)
        db.add(active_session)
        db.commit()
        db.refresh(active_session)
    
    # Create alert
    new_alert = Alert(
        user_id=current_user.id,
        session_id=active_session.id,
        alert_type=alert_data.alert_type,
        severity=alert_data.severity,
        message=alert_data.message,
        eye_aspect_ratio=alert_data.eye_aspect_ratio,
        mouth_aspect_ratio=alert_data.mouth_aspect_ratio,
        blink_count=alert_data.blink_count,
        head_position=alert_data.head_position,
        gaze_metrics=alert_data.gaze_metrics,
        states=alert_data.states,
        duration_ms=alert_data.duration_ms
    )
    
    db.add(new_alert)
    
    # Update session statistics
    active_session.total_alerts += 1
    if "drowsiness" in alert_data.alert_type.lower():
        active_session.drowsiness_alerts += 1
    elif "distraction" in alert_data.alert_type.lower():
        active_session.distraction_alerts += 1
    
    db.commit()
    db.refresh(new_alert)
    
    return AlertResponse.from_orm(new_alert)

@router.get("/history", response_model=List[AlertResponse])
async def get_alert_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> List[AlertResponse]:
    """Get alert history for current user"""
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Alert.timestamp >= start_date)
    if end_date:
        query = query.filter(Alert.timestamp <= end_date)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.timestamp.desc()).offset(offset).limit(limit).all()
    
    return [AlertResponse.from_orm(alert) for alert in alerts]

@router.get("/analytics", response_model=AlertAnalytics)
async def get_alert_analytics(
    period: str = Query("day", regex="^(day|week|month|year)$"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> AlertAnalytics:
    """Get alert analytics for current user"""
    # Calculate date range
    end_date = now_ist()
    if period == "day":
        start_date = end_date - timedelta(days=1)
    elif period == "week":
        start_date = end_date - timedelta(weeks=1)
    elif period == "month":
        start_date = end_date - timedelta(days=30)
    else:  # year
        start_date = end_date - timedelta(days=365)
    
    # Get alerts in period
    alerts = db.query(Alert).filter(
        and_(
            Alert.user_id == current_user.id,
            Alert.timestamp >= start_date,
            Alert.timestamp <= end_date
        )
    ).all()
    
    # Calculate statistics
    total_alerts = len(alerts)
    drowsiness_count = sum(1 for a in alerts if "drowsiness" in a.alert_type.lower())
    distraction_count = sum(1 for a in alerts if "distraction" in a.alert_type.lower())
    
    severity_breakdown = {
        "mild": sum(1 for a in alerts if a.severity == "mild"),
        "moderate": sum(1 for a in alerts if a.severity == "moderate"),
        "severe": sum(1 for a in alerts if a.severity == "severe")
    }
    
    # Calculate hourly distribution
    hourly_distribution = {}
    for alert in alerts:
        hour = alert.timestamp.hour
        hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1
    
    # Get most common alerts
    alert_types = {}
    for alert in alerts:
        alert_types[alert.message] = alert_types.get(alert.message, 0) + 1
    
    most_common_alerts = sorted(
        alert_types.items(), 
        key=lambda x: x[1], 
        reverse=True
    )[:5]
    
    # Calculate risk score (0-100)
    risk_score = min(100, (
        severity_breakdown["severe"] * 10 +
        severity_breakdown["moderate"] * 5 +
        severity_breakdown["mild"] * 2
    ))
    
    # Get recent sessions
    recent_sessions = db.query(MonitoringSession).filter(
        and_(
            MonitoringSession.user_id == current_user.id,
            MonitoringSession.start_time >= start_date
        )
    ).order_by(MonitoringSession.start_time.desc()).limit(10).all()
    
    return AlertAnalytics(
        period=period,
        start_date=start_date,
        end_date=end_date,
        total_alerts=total_alerts,
        drowsiness_alerts=drowsiness_count,
        distraction_alerts=distraction_count,
        severity_breakdown=severity_breakdown,
        hourly_distribution=hourly_distribution,
        most_common_alerts=[{"alert": k, "count": v} for k, v in most_common_alerts],
        risk_score=risk_score,
        total_monitoring_time=sum(
            (s.duration_seconds or 0) for s in recent_sessions
        ),
        sessions_count=len(recent_sessions)
    )

@router.get("/sessions", response_model=List[SessionResponse])
async def get_monitoring_sessions(
    limit: int = Query(20, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> List[SessionResponse]:
    """Get monitoring sessions for current user"""
    sessions = db.query(MonitoringSession).filter(
        MonitoringSession.user_id == current_user.id
    ).order_by(
        MonitoringSession.start_time.desc()
    ).offset(offset).limit(limit).all()
    
    return [SessionResponse.from_orm(session) for session in sessions]

@router.post("/sessions/end")
async def end_monitoring_session(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """End current monitoring session"""
    active_session = db.query(MonitoringSession).filter(
        and_(
            MonitoringSession.user_id == current_user.id,
            MonitoringSession.end_time == None
        )
    ).first()
    
    if not active_session:
        raise HTTPException(
            status_code=404,
            detail="No active session found"
        )
    
    # End session
    active_session.end_time = get_ist_datetime_for_db()
    active_session.duration_seconds = int(
        (active_session.end_time - active_session.start_time).total_seconds()
    )
    
    db.commit()
    
    return {
        "message": "Session ended successfully",
        "session_id": active_session.id,
        "duration_seconds": active_session.duration_seconds,
        "total_alerts": active_session.total_alerts
    }

@router.get("/statistics/daily")
async def get_daily_statistics(
    date: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get or create daily statistics for user"""
    target_date = date or now_ist().date()
    
    # Get existing or create new statistics
    stats = db.query(AlertStatistics).filter(
        and_(
            AlertStatistics.user_id == current_user.id,
            func.date(AlertStatistics.date) == target_date
        )
    ).first()
    
    if not stats:
        # Calculate statistics for the day
        day_start = datetime.combine(target_date, datetime.min.time())
        day_end = datetime.combine(target_date, datetime.max.time())
        
        alerts = db.query(Alert).filter(
            and_(
                Alert.user_id == current_user.id,
                Alert.timestamp >= day_start,
                Alert.timestamp <= day_end
            )
        ).all()
        
        sessions = db.query(MonitoringSession).filter(
            and_(
                MonitoringSession.user_id == current_user.id,
                MonitoringSession.start_time >= day_start,
                MonitoringSession.start_time <= day_end
            )
        ).all()
        
        # Create statistics
        stats = AlertStatistics(
            user_id=current_user.id,
            date=target_date,
            total_monitoring_time=sum((s.duration_seconds or 0) for s in sessions),
            total_alerts=len(alerts),
            drowsiness_mild=sum(1 for a in alerts if a.severity == "mild" and "drowsiness" in a.alert_type.lower()),
            drowsiness_moderate=sum(1 for a in alerts if a.severity == "moderate" and "drowsiness" in a.alert_type.lower()),
            drowsiness_severe=sum(1 for a in alerts if a.severity == "severe" and "drowsiness" in a.alert_type.lower()),
            distraction_mild=sum(1 for a in alerts if a.severity == "mild" and "distraction" in a.alert_type.lower()),
            distraction_moderate=sum(1 for a in alerts if a.severity == "moderate" and "distraction" in a.alert_type.lower()),
            distraction_severe=sum(1 for a in alerts if a.severity == "severe" and "distraction" in a.alert_type.lower()),
            total_yawns=sum(1 for a in alerts if "yawn" in a.message.lower()),
            phone_usage_count=sum(1 for a in alerts if "phone" in a.message.lower() or "mobile" in a.message.lower()),
            head_turn_count=sum(1 for a in alerts if "head turn" in a.message.lower()),
        )
        
        # Calculate risk score
        stats.daily_risk_score = min(100, (
            stats.drowsiness_severe * 10 +
            stats.drowsiness_moderate * 5 +
            stats.drowsiness_mild * 2 +
            stats.distraction_severe * 8 +
            stats.distraction_moderate * 4 +
            stats.distraction_mild * 1
        ))
        
        db.add(stats)
        db.commit()
        db.refresh(stats)
    
    return {
        "date": stats.date,
        "total_monitoring_time": stats.total_monitoring_time,
        "total_alerts": stats.total_alerts,
        "drowsiness": {
            "mild": stats.drowsiness_mild,
            "moderate": stats.drowsiness_moderate,
            "severe": stats.drowsiness_severe
        },
        "distraction": {
            "mild": stats.distraction_mild,
            "moderate": stats.distraction_moderate,
            "severe": stats.distraction_severe
        },
        "specific_events": {
            "yawns": stats.total_yawns,
            "phone_usage": stats.phone_usage_count,
            "head_turns": stats.head_turn_count
        },
        "risk_score": stats.daily_risk_score
    }