# backend/app/models/__init__.py
from importlib import import_module
from pathlib import Path
from pkgutil import iter_modules

_pkg_path = Path(__file__).parent

# import each .py module in this package (skip private/_ files and subpackages)
for _finder, _name, _is_pkg in iter_modules([str(_pkg_path)]):
    if _is_pkg or _name.startswith("_"):
        continue
    import_module(f"{__name__}.{_name}")
