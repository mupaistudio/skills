---
name: vault-provision
description: "나만의 지식창고(볼트, 비밀번호 보관용 금고가 아님)에 새 주제(topic)의 빈 골격을 만든다 — topic/ 아래 README(개요)·INDEX(문서 지도)·_inbox/ 를 규약대로 생성하고, 지식창고 루트에 CLAUDE.md(구조 규약)가 없으면 함께 깐다. 주제는 몇 개든 만들 수 있다(여러 개를 한 번에 줘도 된다). idempotent — 이미 있으면 빠진 것만 보강, 모르는 건 '확인 필요'로 두고 지어내지 않는다. Create the skeleton for a new topic in a personal knowledge vault (README, INDEX, _inbox) and install the vault's CLAUDE.md conventions on first use. Triggers: vault provision, new topic, create topic, 볼트 프로비저닝, 새 주제, 주제 추가, 지식창고 만들기, 주제 초기화."
---

# 볼트 프로비저닝 (주제 초기화)

새 주제가 생길 때마다 **그 주제의 빈 골격을 한 번 깐다.** 주제는 무한히 만들 수 있다 — 주제 하나 = 폴더 하나다. 원재료를 정리해 넣는 일은 `vault-ingest`, 여기서는 뼈대만 세운다.

## 입력

- **주제 slug** (필수) — 폴더 이름. 소문자·하이픈·짧게(예: `cooking`, `invest-notes`). 여러 개를 한 번에 받으면 하나씩 반복한다.
- **개요** (선택) — 무슨 주제인지 한 줄~한 문단. 없으면 사용자에게 묻거나 "확인 필요"로 둔다.
- **지식창고 루트** (선택) — 기본은 현재 작업 폴더(git 저장소면 그 루트). 처음이면 어디를 루트로 쓸지 한 번 확인한다.

## 절차

1. **루트 확인 · 규약 깔기** — 루트에 `CLAUDE.md` 가 없으면 이 스킬의 `references/claude-md.template.md` 를 `CLAUDE.md` 로 복사한다(이미 있으면 덮지 않는다). 다른 vault-* 스킬은 이 문서를 구조의 단일 출처로 연다.
2. **존재 확인 (idempotent)** — `<topic>/` 이 이미 있으면 새로 만들지 않고 **빠진 파일만 보강**한다.
3. **최소 골격 생성** — 규약대로:
   - `<topic>/README.md` — 개요 · 범위(무엇을 담고 무엇은 안 담나) · 용어 · 외부 자료 포인터 · 이력 한 줄. 아는 것만 채우고 모르면 "확인 필요".
   - `<topic>/INDEX.md` — 문서 지도(표 머리만): `| 문서 | 요약 | 상태 | 위치 |`
   - `<topic>/_inbox/.gitkeep` — 정리 대기소
4. **빈 폴더는 미리 만들지 않는다** — `docs/` 는 `vault-ingest` 가 첫 문서를 만들 때, `history/<topic>/` 은 `vault-session` 이 첫 기록을 쓸 때 만든다.
5. **보고** — 만들거나 보강한 파일을 한 줄씩 요약한다. 규약 파일을 새로 깔았으면 그것도 알린다.

## 산출

- `<topic>/` 초기 골격(README · INDEX · _inbox) · (처음이면) 루트 `CLAUDE.md`.
- 이후: 원재료는 `vault-push` → `vault-ingest` 로 쌓이고, 세션이 한 일은 `vault-session` 으로 남는다.

## 원칙

- **idempotent** — 다시 실행해도 안전. 있는 것은 덮지 않고 빠진 것만 채운다.
- **지어내지 않음** — 모르는 것은 "확인 필요". 실물 자료는 위치(포인터)로 가리킨다.
- **한 스킬 한 일** — 골격은 여기서, 개별 문서는 `vault-ingest`, 기록은 `vault-session`.
