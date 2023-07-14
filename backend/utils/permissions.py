from functools import wraps
from typing import TypeVar, Callable, Any, cast

from flask_login import current_user

from enums import ERROR_CODES, Permission
from utils.custom_error import CustomError

TFun = TypeVar('TFun', bound=Callable[..., Any])


def is_admin(user):
    return user.admin

def has_permission(permission: Any, user = current_user) -> bool:
    if user is None or not user.is_authenticated:
        return False
    if not permission:
        return True
    if permission == Permission.ADMIN:
        return user.admin == True

def permission_required(permission = None) -> Callable[[TFun], TFun]:
    def decorator(f: TFun) -> TFun:
        @wraps(f)
        def decorated_function(*args: Any, **kwargs: Any) -> Any:
            if has_permission(permission):
                return f(*args, **kwargs)
            else:
                raise CustomError(ERROR_CODES.ERR_PERMISSION_DENIED, status_code=401)
        return cast(TFun, decorated_function)
    return decorator