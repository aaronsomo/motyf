from typing import Any

from enums import ERROR_CODES


class CustomError(Exception):
    error_code: ERROR_CODES
    status_code: int
    error_meta: Any

    def __init__(self, error_code: ERROR_CODES, status_code: int = 200, error_meta: Any = None):
        self.error_code = error_code
        self.status_code = status_code
        self.error_meta = error_meta
