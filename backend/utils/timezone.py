"""
Timezone utilities for converting UTC to IST (Indian Standard Time)
"""
from datetime import datetime, timezone, timedelta
from typing import Optional

# IST timezone offset (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def now_ist() -> datetime:
    """Get current time in IST timezone"""
    return datetime.now(IST)

def utc_to_ist(utc_dt: datetime) -> datetime:
    """Convert UTC datetime to IST timezone"""
    if utc_dt.tzinfo is None:
        # Assume naive datetime is UTC
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    return utc_dt.astimezone(IST)

def ist_to_utc(ist_dt: datetime) -> datetime:
    """Convert IST datetime to UTC timezone"""
    if ist_dt.tzinfo is None:
        # Assume naive datetime is IST
        ist_dt = ist_dt.replace(tzinfo=IST)
    return ist_dt.astimezone(timezone.utc)

def format_ist_timestamp(dt: Optional[datetime] = None) -> str:
    """Format datetime as IST timestamp string (HH:MM:SS format)"""
    if dt is None:
        dt = now_ist()
    elif dt.tzinfo is None:
        # Assume naive datetime is UTC and convert to IST
        dt = dt.replace(tzinfo=timezone.utc).astimezone(IST)
    elif dt.tzinfo != IST:
        # Convert to IST if different timezone
        dt = dt.astimezone(IST)
    
    return dt.strftime("%H:%M:%S")

def get_ist_datetime_for_db() -> datetime:
    """Get current IST datetime for database storage (as naive datetime)"""
    return now_ist().replace(tzinfo=None)