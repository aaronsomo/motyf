from datetime import datetime, timedelta
from functools import wraps
from typing import TypeVar, Callable, Any, cast

from wsgiref.handlers import format_date_time

TFun = TypeVar('TFun', bound=Callable[..., Any])

def browsercache(days: int =1, public: bool=False) -> Callable[[TFun], TFun]:
    """ Decorator to add browser cache headers. Caches for days indicated, truncated to end of day"""
    def decorator(f: TFun) -> TFun:
        @wraps(f)
        def decorated_function(*args: Any, **kwargs: Any) -> Any:
            r = f(*args, **kwargs)

            # Expire at end of day based on GMT timezone
            now = datetime.utcnow() + timedelta(days=days - 1)
            end_of_day = datetime(now.year, now.month, now.day, 23, 59, 59, tzinfo=now.tzinfo)
            r.headers.add('Expires', format_date_time(end_of_day.timestamp()))
            r.headers.add('Cache-Control', 'public' if public else 'private')
            return r
        return cast(TFun, decorated_function)
    return decorator
