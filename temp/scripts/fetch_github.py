"""
fetch_github.py — 获取 Coltelli 的私有仓库总数，写入 src/data/github_stats.json

在 GitHub Actions 中运行，需提供 GH_PAT secret（具有 repo scope 的 Personal Access Token）。
本地运行时需设置 GITHUB_TOKEN 环境变量。
"""

import json
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Please install requests: pip install requests")
    sys.exit(1)


GITHUB_USER = "Coltelli"
GITHUB_API = "https://api.github.com"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "src" / "data" / "github_stats.json"


def get_headers() -> dict[str, str]:
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_PAT")
    if not token:
        print("::warning::No GITHUB_TOKEN/GH_PAT set — private repos count will be 0")
        return {"Accept": "application/vnd.github+json"}
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def fetch_user_stats(headers: dict[str, str]) -> dict:
    """获取用户概览信息，包含 total_private_repos。"""
    url = f"{GITHUB_API}/users/{GITHUB_USER}"
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return {
        "public_repos": data.get("public_repos", 0),
        "total_private_repos": data.get("total_private_repos", 0),
        "owned_private_repos": data.get("owned_private_repos", 0),
    }


def fetch_private_repos(headers: dict[str, str]) -> list[dict]:
    """分页拉取所有私有仓库列表（需要 token）。"""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_PAT")
    if not token:
        return []

    repos = []
    page = 1
    per_page = 100

    while True:
        url = (
            f"{GITHUB_API}/user/repos"
            f"?type=private&per_page={per_page}&page={page}&sort=updated"
        )
        resp = requests.get(url, headers=headers, timeout=30)

        if resp.status_code == 401:
            print("::warning::Token lacks permission to list private repos")
            return []
        resp.raise_for_status()

        page_data = resp.json()
        if not page_data:
            break

        repos.extend(page_data)
        if len(page_data) < per_page:
            break
        page += 1

    return repos


def main():
    headers = get_headers()

    # 获取用户统计
    try:
        stats = fetch_user_stats(headers)
    except Exception as e:
        print(f"::warning::Failed to fetch user stats: {e}")
        stats = {"public_repos": 0, "total_private_repos": 0, "owned_private_repos": 0}

    # 获取私有仓库列表（仅计数，不暴露仓库名）
    private_count = stats["owned_private_repos"] or stats["total_private_repos"] or 0
    try:
        private_repos = fetch_private_repos(headers)
        if private_repos:
            private_count = len(private_repos)
    except Exception as e:
        print(f"::warning::Could not enumerate private repos: {e}")

    output = {
        "public_repos": stats["public_repos"],
        "private_repos": private_count,
        "updated_at": None,  # 由 CI 填入时间戳
    }

    # 确保目录存在
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Stats written to {OUTPUT_PATH}")
    print(f"  public:  {output['public_repos']}")
    print(f"  private: {output['private_repos']}")


if __name__ == "__main__":
    main()
