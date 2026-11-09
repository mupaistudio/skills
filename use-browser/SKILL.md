---
name: use-browser
description: Claude Code controls a dedicated Chrome directly through the Chrome DevTools Protocol (CDP) - open pages, click, type, take screenshots, evaluate JS, collect console errors and failed network requests, and run multi-step browser scenarios without writing a one-off Playwright script each time. Use when the user asks to test or inspect a web page in a real browser, capture a screenshot, check console/network errors, automate clicks and typing, or says "use-browser", "open the browser", "CDP", "remote debugging". 브라우저를 직접 조작, 크롬 띄워, 페이지 캡처, 콘솔 에러 수집, 네트워크 실패 확인, 클릭/입력 자동화, 화면 테스트 요청에 사용.
---

# use-browser

CDP 포트에 떠 있는 **전용 Chrome**(평소 쓰는 Chrome 과 프로필이 분리됨)을 명령어로 조작한다. 평소 Chrome 은 건드리지 않는다.
Windows 전용(PowerShell). 아래 `<스킬>` 은 이 스킬을 불렀을 때 알려 주는 「Base directory」(`SKILL.md` 가 있는 폴더)다.

## 처음 한 번 — 준비

1. 필요한 프로그램: Node.js 18+ (npm 포함), Google Chrome, PowerShell 5.1+.
2. `node <스킬>/scripts/ensure-deps.js` → `DEPS_OK` 또는 `DEPS_INSTALLED` 가 나오면 끝. 실패하면 출력된 이유(Node/npm 없음, 인터넷 없음)를 그대로 사용자에게 알린다.
   playwright-core 고정 판이 `~/.local/share/use-browser/browser` 에 깔린다. 스킬 폴더에는 아무것도 깔리지 않는다.

## 작업 순서

1. **지난 작업 찾기** — `references/INDEX.md` 에서 같은 사이트 · 같은 작업이 있으면 해당 `references/cases/` 파일을 읽고 함정을 흡수한다.
2. **Chrome 기동** — `powershell -ExecutionPolicy Bypass -File <스킬>/scripts/start.ps1 [-Port 9333] [-Profile <이름>] [-Url <주소>]`. 이미 떠 있으면 아무 일도 안 한다. 로그인 상태는 프로필에 남는다.
3. **명령 실행** — 포트는 `-Port` → 환경변수 `CDP_PORT` → 기본 `9333`. JS 명령은 같은 `CDP_PORT` 로 연결하므로 `$env:CDP_PORT=9333` 처럼 맞춘다.
4. **결과 확인** — 단계마다 화면 · 값을 확인한다. 추측하지 말고 `shot` · `eval` 로 본다.
5. **정리** — 끝나면 `stop.ps1`(자기 포트의 Chrome 만 종료). `-All` 은 사용자가 직접 요청할 때만.
6. **기록** — 반복할 만한 작업이면 `references/cases/<날짜>_<슬러그>.md`(요청 · 진행 순서 · 결과 · 주의할 점)를 쓰고 `references/INDEX.md` 에 한 줄 더한다. 비밀번호 · 토큰은 적지 않는다.

## 즉석 명령 `scripts/remote.js`

```
node <스킬>/scripts/remote.js tabs
node <스킬>/scripts/remote.js navigate <url> [--tab=<번호|주소일부>] [--new]
node <스킬>/scripts/remote.js reload [--hard]
node <스킬>/scripts/remote.js shot <이름> [--case=<슬러그>] [--full] [--clip=x,y,w,h]
node <스킬>/scripts/remote.js click <selector>
node <스킬>/scripts/remote.js mouse <x> <y> [--dbl]     # 좌표 클릭(실제 입력)
node <스킬>/scripts/remote.js type <selector> <글자>     # React 호환 입력
node <스킬>/scripts/remote.js keys <글자> [--select-all] [--enter]   # 지금 포커스에 키 입력
node <스킬>/scripts/remote.js wait <selector> [--ms=10000]
node <스킬>/scripts/remote.js attrs <selector>
node <스킬>/scripts/remote.js eval "<js 식>"
node <스킬>/scripts/remote.js collect 5000                # 5초간 콘솔 오류 + 네트워크 실패
node <스킬>/scripts/remote.js close --tab=<번호>
node <스킬>/scripts/remote.js workdir [--case=<슬러그>] [--clean]   # 캡처 임시 폴더
```

캡처는 임시 폴더(`%TEMP%/use-browser/<슬러그>/`, 환경변수 `USE_BROWSER_WORK` 로 변경)에 저장된다. 스킬 폴더에는 쓰지 않는다.

## 여러 단계 시나리오 `scripts/run.js`

```
node <스킬>/scripts/run.js <step.js> --case=<슬러그> [--tab=<선택>] [--accept-dialogs]
```

`step.js` 는 `module.exports = async (H) => { ...; return 결과 }`. `H` = `page · cdp · context · wait · front · shot · mouse · clickAt · dragTo · key · type · ime · ev · S · mark · DIR`.
`mark('단계')` 뒤의 쓰기 요청 · 4xx/5xx · 콘솔 오류 · 대화상자가 그 단계로 묶여 `<DIR>/diagnostics/<step>.json` 에 남는다(토큰 · 비밀번호는 가려 적는다).

## 지킬 것

- **실제 입력으로 판정한다.** `clickAt` · `key` · `type` 은 브라우저에 실제 입력(isTrusted)을 보낸다. 스크립트로 `element.click()` · 값 대입만 해서 「됐다」 고 하지 않는다 — 앱이 값을 못 알아보는 칸이 있다(선택 칸은 포커스 후 방향키가 확실하다).
- 쓰기(저장 · 삭제 · 결제 · 전송)는 사용자가 허락한 것만 한다. 누르기 전에 눌릴 칸 · 선택이 앱에 먹었는지 값을 되읽는다.
- 자동 조작은 JS 알림창 · 확인창에 막힌다. 알림이 뜰 수 있는 버튼은 누르기 전에 알리고, 창이 뜨면 `--accept-dialogs` 나 `H.page.on('dialog')` 로 처리한다.
- 로그인 · 비밀번호는 사용자가 직접 한다. 계정 값을 스킬 파일 · 기록에 남기지 않는다.
- 창을 최소화하거나 다른 탭 뒤에 두면 캡처 · 입력이 멈출 수 있다. 응답이 없으면 `front` 로 탭을 앞으로 가져온다.
- 다른 프로그램이 쓰는 포트를 띄우거나 끄지 않는다. 동시에 여러 개가 필요하면 `-Port` 와 `-Profile` 을 서로 다르게 쓴다.
- 로그인이 오래 필요한 사이트는 세션이 만료될 수 있다(응답 401). 쓰기 직전에 만료되면 요청이 도중에 끊기니 시간이 걸리는 작업은 중간에 다시 로그인한다.
