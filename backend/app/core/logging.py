import logging


def configure_logging() -> None:
    # Minimal, can be replaced by dictConfig later.
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s %(asctime)s %(name)s: %(message)s",
    )
