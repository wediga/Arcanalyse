# backend/app/api/v1/__init__.py
from __future__ import annotations

import importlib
import pkgutil
from pathlib import Path
from types import ModuleType

from fastapi import APIRouter


def _discover_router_modules() -> list[tuple[int, ModuleType]]:
    """Find modules in this package that expose a `router: APIRouter`."""
    pkg_path = Path(__file__).parent
    modules: list[tuple[int, ModuleType]] = []

    for _finder, modname, is_pkg in pkgutil.iter_modules([str(pkg_path)]):
        if is_pkg or modname.startswith("_"):
            continue
        module = importlib.import_module(f"{__name__}.{modname}")
        mod_router = getattr(module, "router", None)
        if isinstance(mod_router, APIRouter):
            order = getattr(module, "ROUTER_ORDER", 100)
            modules.append((order, module))

    modules.sort(key=lambda x: (x[0], x[1].__name__))
    return modules


def build_router() -> APIRouter:
    """Build a single APIRouter that includes all v1 routers."""
    api = APIRouter()
    for _order, module in _discover_router_modules():
        api.include_router(module.router)
    return api


# exported: can be included by the API main router
router = build_router()
