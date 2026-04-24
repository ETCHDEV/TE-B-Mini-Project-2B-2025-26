"""
run.py — convenience launcher
Usage:  uv run python run.py
        uv run python run.py --port 8080 --reload
"""

import argparse
import uvicorn

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--reload", action="store_true", default=False)
    parser.add_argument("--workers", type=int, default=1)
    args = parser.parse_args()

    print(f"""
╔══════════════════════════════════════════════════════╗
║   Multi-Platform Review Sentiment Analyzer           ║
║   http://{args.host}:{args.port}                             ║
║   Swagger UI → http://localhost:{args.port}/docs             ║
╚══════════════════════════════════════════════════════╝
    """)

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers if not args.reload else 1,
        log_level="info",
    )
