---
name: vault-push
description: "지식창고(볼트)의 정리 대기소(topic/_inbox/)에 원재료를 놓는다 — 아직 정리 안 된 메모·결정·붙여넣은 문서·자료 위치 포인터를 '날짜-주제.md' 파일로 떨군다. 분류·문서화·INDEX 는 하지 않는다(그건 vault-ingest). 사람이 _inbox 에 파일을 직접 드롭해도 같은 push 다. 코드·긴 원문은 위치(포인터)로만. Drop raw material (notes, decisions, pasted text, pointers) into a topic's _inbox of a personal knowledge vault, without classifying it. Triggers: vault push, inbox, save for later, 대기소에 넣기, 인박스, 원재료 던지기, 나중에 정리할 거 저장, 이거 남겨줘(정리 전)."
---

# 볼트 푸시 (대기소에 놓기)

정리할 **원재료를 그 주제의 `<topic>/_inbox/` 에 놓는 것**이 전부다. 분류·문서화는 하지 않는다 — 그건 `vault-ingest`. **사람이 `_inbox/` 에 파일을 직접 드롭해도 똑같은 push** 다. 구조는 루트 `CLAUDE.md` 가 단일 출처다.

## 입력

- **원재료** — 메모 · 결정 · 붙여넣은 문서 · "여기 규칙 있다 [위치]" 식 포인터.
- **대상 주제** — 어느 `<topic>/_inbox/` 인지. 모르면 묻는다(정 애매하면 파일 안에 힌트만 적어 던진다). 주제 폴더가 없으면 `vault-provision` 을 먼저 하라고 알린다.

## 절차

1. **대상 확인** — `<topic>/_inbox/` 경로 확정. `_inbox/` 폴더만 없으면 만든다.
2. **파일로 떨구기** — `날짜-주제.md`(예: `2026-11-09-환불규칙-메모.md`)로 저장한다. 어느 문서에 속하는지 아직 안 정해도 된다.
3. **포인터 원칙** — 긴 코드 · 데이터 · 원문은 붙이지 말고 위치로 가리킨다.
4. **비밀 · 개인정보 제외** — 토큰 · 비밀번호 · 전화번호 · 계좌는 쓰지 않는다. 자리만 적는다.

## 산출

- `<topic>/_inbox/` 에 쌓인 원재료 파일 1개 이상. (다음: `vault-ingest` 가 정리해 넣고 비운다.)

## 경계

- **문서화 · INDEX · 템플릿은 여기서 하지 않는다** — push 는 캡처, 구조화는 `vault-ingest`.
- 대기소는 임시다 — ingest 가 소비 후 비운다.
