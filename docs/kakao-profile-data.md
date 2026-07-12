# Kakao profile data in PlayMCP

조사일: 2026-07-12

## 결론

**PlayMCP 또는 Kakao Tools가 로그인한 질문자의 생년월일과 성별을 MCP 도구 인자로 자동 전달한다는 공식 스펙은 확인되지 않았다.** PlayMCP의 로그인 및 MCP Gateway OAuth는 사용자가 자신의 도구함에 접근하기 위한 인증이며, 공개 문서에는 이 인증으로 얻은 카카오계정의 `birthyear`, `birthday`, `gender`를 제3자 MCP 서버에 주입한다는 내용이 없다.

따라서 현재 공모전 MCP가 질문자의 카카오 프로필을 별도 동의 없이 바로 받는 방식은 **지원된다고 볼 수 없다**.

다만 PlayMCP는 사용자 인증이 필요한 MCP에 OAuth 또는 커스텀 헤더 방식을 지원한다. 이를 이용해 **우리 MCP 서비스가 별도의 OAuth 연동을 제공하고, 그 연동 과정에서 별도의 카카오 로그인을 수행해 사용자 동의를 받은 뒤** 생년월일과 성별을 조회하는 구성은 기술적으로 가능하다. 이것은 PlayMCP의 카카오 계정 정보를 자동으로 받는 기능이 아니라, 개발자가 별도의 카카오디벨로퍼스 앱과 인증 서버를 운영하는 방식이다.

현재 사주 MCP에는 이 기능을 예선 제출 전에 추가하지 않는 편이 합리적이다. 출생 연도ㆍ월ㆍ일과 성별을 받아도 출생 시각과 출생지는 카카오 로그인에서 제공하지 않으므로 결국 추가 질문이 필요하고, OAuth 서버ㆍ개인정보 처리방침ㆍ동의항목 심사ㆍ토큰 보호가 새로 필요해진다.

## 세 가지 인증을 구분해야 한다

### 1. PlayMCP 로그인과 MCP Gateway OAuth

PlayMCP 공식 문서는 MCP Gateway를 사용자의 도구함에 접근하기 위한 OAuth2 엔드포인트로 설명한다. 외부 에이전트 연결 과정에서 PlayMCP 로그인 후 OTT를 액세스ㆍ리프레시 토큰으로 교환하며, 연결 예시의 스코프는 `home`이다. 이 문서에는 카카오계정 프로필 스코프나 생년월일ㆍ성별 전달 필드가 정의되어 있지 않다.

- [PlayMCP 공식 AI 문서](https://playmcp.kakao.com/llms.txt)
- [외부 에이전트용 MCP Gateway 연결 가이드](https://playmcp.kakao.com/llms/mcp-connection-guide.md)

**추론:** 공개된 Gateway 문서가 도구함 접근 토큰과 `home` 스코프만 정의하므로, 이 토큰을 카카오 로그인 사용자 정보 API의 액세스 토큰으로 사용하거나 질문자의 카카오 프로필을 조회할 수 있다고 해석해서는 안 된다.

### 2. PlayMCP가 지원하는 개별 MCP 서버 인증

PlayMCP 서버 개발가이드는 사용자 인증이 필요한 MCP가 OAuth 또는 커스텀 헤더를 지원해야 한다고 명시한다. OAuth MCP를 등록하면 다음 형태의 PlayMCP 콜백 URI를 개발자의 OAuth 클라이언트에 등록해야 한다.

```text
https://playmcp.kakao.com/api/v1/applied-mcps/{mcpId}/authorize/oauth:callback
```

PlayMCP는 OAuth 또는 Key/Token으로 인증된 MCP를 사용할 수 있고, 사용자가 인증 정보를 삭제하거나 교체할 수 있다. 이 인증은 **우리 MCP 서비스의 계정ㆍ데이터에 접근하기 위한 인증**이지, PlayMCP 회원의 카카오 프로필을 MCP에 공개하는 기능이 아니다.

- [PlayMCP 이용가이드](https://kko.kakao.com/playmcp_guide)
- [OAuth Redirect URI 안내](https://app.notion.com/p/OAuth-Redirect-URI-2389b97b488880119a37dab713ffaa67?pvs=25)
- [MCP 인증정보 관리 안내](https://app.notion.com/p/MCP-2389b97b488880f6b153e7ae35b976a1?pvs=25)
- [PlayMCP 서버 개발가이드](https://www.notion.so/MCP-2d89b97b4888808a9e1dc17a13e70187)

### 3. 카카오 로그인 일반 API

카카오 로그인은 카카오디벨로퍼스에 등록한 **개별 서비스 앱**을 위한 OAuth 기능이다. 우리 서비스가 발급받은 앱 키로 사용자를 별도로 로그인시키고, 사용자가 해당 앱의 동의항목에 동의해야 사용자 정보 조회 API를 호출할 수 있다.

PlayMCP에 로그인한 사실만으로 우리 카카오디벨로퍼스 앱에도 로그인되거나 동의가 승계되는 것은 공식 문서에 명시되어 있지 않다.

- [카카오 로그인 이해하기](https://developers.kakao.com/docs/ko/kakaologin/common)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/ko/kakaologin/rest-api)

## 카카오 로그인으로 받을 수 있는 값

사주 입력에 필요한 정보 중 카카오 로그인 일반 API가 제공할 수 있는 값은 다음과 같다.

| 용도 | 동의항목 ID | 사용자 정보 조회 응답 | 형식 |
| --- | --- | --- | --- |
| 출생 연도 | `birthyear` | `kakao_account.birthyear` | `YYYY` |
| 생일 | `birthday` | `kakao_account.birthday` | `MMDD` |
| 양력ㆍ음력 | `birthday` | `kakao_account.birthday_type` | `SOLAR` 또는 `LUNAR` |
| 윤달 여부 | `birthday` | `kakao_account.is_leap_month` | Boolean |
| 성별 | `gender` | `kakao_account.gender` | `female` 또는 `male` |

각 정보에는 동의가 더 필요한지 나타내는 `birthyear_needs_agreement`, `birthday_needs_agreement`, `gender_needs_agreement` 필드가 함께 정의되어 있다. `생년월일`을 완성하려면 `birthyear`와 `birthday` 두 동의항목이 모두 필요하다. 출생 시각과 출생지는 제공 필드에 없으므로 사용자에게 직접 받아야 한다.

출처:

- [개인정보 동의항목과 ID](https://developers.kakao.com/docs/ko/kakaologin/utilize#user-consent-personal-information)
- [사용자 정보 조회 API와 응답 필드](https://developers.kakao.com/docs/ko/kakaologin/rest-api#req-user-info)

주의할 점은 일반 `birthday`와 `gender`가 카카오계정에 등록된 값이라는 점이다. 공식 문서는 이 값을 법적으로 검증된 본인확인정보라고 설명하지 않는다. 법정 생년월일ㆍ법정 성별은 별도의 제휴 필요 정보이므로 이 MCP에서는 요청하지 않는 것이 맞다.

## 필요한 동의와 OAuth 절차

### 앱 설정과 심사

1. 카카오디벨로퍼스에 서비스 앱을 등록하고 카카오 로그인을 활성화한다.
2. 카카오 로그인 Redirect URI를 우리 인증 서비스의 콜백으로 등록한다.
3. `birthyear`, `birthday`, `gender` 동의항목을 설정한다.
4. 해당 항목을 필수ㆍ선택ㆍ이용 중 동의로 설정하려면 동의 단계 설정 권한을 받아야 한다.
5. 정식 서비스 권한 신청에는 비즈 앱 전환, 신청 자격 확인, 비즈니스 정보 심사, 회원가입 또는 서비스 화면, 개인정보 처리방침, 수집 목적과 필수ㆍ선택 조건을 증빙해야 한다.

카카오 공식 문서는 이 세 항목 모두 `[필수, 선택, 이용 중 동의]` 설정에 동의 단계 설정 권한이 필요하다고 안내한다. 테스트 앱 권한으로 검수 전 개발은 가능하지만, 일반 사용자를 대상으로 제공하려면 정식 권한과 심사를 준비해야 한다.

- [카카오 로그인 설정과 개인정보 동의항목 심사](https://developers.kakao.com/docs/ko/kakaologin/prerequisite#consent-item)
- [동의항목별 지원 단계와 필요 권한](https://developers.kakao.com/docs/ko/kakaologin/utilize#user-consent-personal-information)

### OAuth 요청 스코프

앱에 동의항목을 설정한 뒤 카카오 로그인 인가를 진행한다. 아직 동의하지 않은 항목을 추가 동의받을 때는 인가 코드 요청의 `scope`에 다음 ID를 지정한다.

```text
scope=birthyear,birthday,gender
```

`scope`는 여러 항목을 쉼표로 구분한다. OpenID Connect를 활성화한 앱에서 추가 동의를 요청한다면 `openid`도 포함해야 ID 토큰이 다시 발급된다. 사주 MCP는 ID 토큰보다 사용자 정보 조회 API가 필요한 값을 더 명확하게 제공하므로, 특별한 이유가 없다면 카카오 액세스 토큰으로 `/v2/user/me`를 조회하는 방식이 단순하다.

- [인가 코드 요청과 추가 동의](https://developers.kakao.com/docs/ko/kakaologin/rest-api#request-code-additional-consent)

### 사용자 정보 조회

동의 후 발급된 **우리 카카오디벨로퍼스 앱의 사용자 액세스 토큰**으로 다음 API를 호출한다.

```http
GET https://kapi.kakao.com/v2/user/me
Authorization: Bearer ${KAKAO_USER_ACCESS_TOKEN}
```

필요한 범위만 조회한다면 다음과 같은 `property_keys` 구성을 사용할 수 있다.

```json
[
  "kakao_account.birthyear",
  "kakao_account.birthday",
  "kakao_account.gender"
]
```

사용자가 동의하지 않았거나 카카오가 정보를 보유하지 않은 경우 값이 제공되지 않을 수 있으므로, MCP는 누락된 필드를 다시 질문하는 예외 처리가 필요하다. 카카오계정에 값이 없을 때 동의 화면에서 수집해 제공하는 `카카오계정으로 수집 후 제공` 기능도 있으나, 이 역시 앱 설정과 사용자 동의를 전제로 한다.

- [사용자 정보 조회 API](https://developers.kakao.com/docs/ko/kakaologin/rest-api#req-user-info)
- [카카오계정으로 수집 후 제공](https://developers.kakao.com/docs/ko/kakaologin/utilize#user-consent-collect-and-provide)

## PlayMCP와 결합할 때의 예상 구조

공식 문서로 확인되는 기능을 조합하면 다음 구조가 가능하다.

```text
사용자
  -> PlayMCP에서 MCP의 "인증하기"
  -> 우리 OAuth 인증 서비스
  -> 별도의 카카오 로그인 및 birthyear/birthday/gender 동의
  -> 우리 서비스가 카카오 사용자 정보 API 조회
  -> 우리 OAuth 인증 서비스가 PlayMCP용 MCP 액세스 토큰 발급
  -> PlayMCP가 해당 토큰으로 우리 MCP 호출
  -> MCP가 프로필 값으로 일부 입력을 채우고 출생 시각ㆍ출생지를 질문
```

**추론:** 카카오 로그인 인증 서버를 PlayMCP MCP OAuth에 그대로 직접 연결할 수 있다는 공식 가이드는 없다. PlayMCP는 MCP 표준 OAuth 흐름을 요구하고, 카카오 로그인은 카카오디벨로퍼스 앱용 OAuth 흐름을 제공한다. 따라서 두 흐름을 연결하고 PlayMCP용 토큰을 발급하는 우리 인증 서비스가 필요할 가능성이 높다. 구현 전에 PlayMCP 개발자 문의 채널에서 이 중첩 OAuth 구성이 심사 가능한지 확인해야 한다.

또한 PlayMCP 계정과 카카오 로그인 앱의 사용자 ID를 동일한 사용자라고 자동 매핑할 공식 필드도 확인되지 않았다. 연결은 사용자가 우리 MCP 인증 흐름을 완료한 사실을 기준으로 우리 서비스가 관리해야 한다.

## 공모전과 PlayMCP 심사 정책상 판단

### 공식 문서로 확인된 사항

- 공모전은 PlayMCP 서버 등록과 심사를 요구하며, 본선에서는 Kakao Tools 추가 개발을 요구한다.
- PlayMCP 자체는 개인정보가 필요한 OAuth MCP를 지원한다.
- OAuth MCP가 개인정보를 카카오에 전달한다면 사용자에게 개인정보 제3자 제공 동의 화면을 제공할 것을 권장한다.
- Tool 기능과 무관한 개인정보를 요구하면 안 된다.
- OAuth 또는 Token/Key로 얻은 인증 정보는 Tool 사용 목적 외 용도로 사용할 수 없다.
- 반드시 필요한 경우를 제외하고 사용자 인증정보나 민감정보를 외부로 전송하면 안 된다.
- 제3자 서비스의 인증정보를 사용하는 경우 등록자와 인증정보 제공사의 관계에 따라 심사가 반려될 수 있다.

- [AGENTIC PLAYER 10 공식 안내](https://b.kakao.com/views/PlayMCP/AGENTIC_PlAYER_10)
- [PlayMCP 서버 개발가이드](https://www.notion.so/MCP-2d89b97b4888808a9e1dc17a13e70187)
- [PlayMCP MCP 심사 정책](https://www.notion.so/MCP-21b9b97b48888024922ec3dfcacf97e5)

### 판단

**추론:** 생년월일과 성별은 사주 계산 기능과 직접 관련되므로 PlayMCP 정책상 무관한 개인정보 수집에는 해당하지 않을 가능성이 높다. 금지 항목 목록에도 포함되어 있지 않으며, OAuth MCP 자체가 공식 지원되므로 공모전 참가 MCP에서 원칙적으로 불가능한 구성은 아니다.

그러나 다음 조건을 모두 충족해야 실제 심사를 통과할 수 있다고 보는 것이 안전하다.

1. 카카오디벨로퍼스 앱이 `birthyear`, `birthday`, `gender` 동의항목 사용 권한을 정식으로 확보할 것
2. PlayMCP용 OAuth 인증 흐름과 카카오 로그인 흐름을 명확히 분리할 것
3. 사용자에게 수집 목적, 항목, 필수ㆍ선택 여부, 보유기간과 제3자 제공 내용을 고지할 것
4. 원본 생년월일ㆍ성별과 카카오 사용자 액세스 토큰을 LLM 프롬프트나 MCP 응답에 포함하지 않을 것
5. 외부 LLM에는 지금처럼 계산된 비식별 사주 사실 카드만 보내고, 원본 프로필 데이터와 인증 토큰은 보내지 않을 것
6. 토큰은 암호화 또는 단기 토큰 방식으로 보호하고, 로그에 남기지 않으며, 연동 해제와 삭제 경로를 제공할 것
7. 인증이 없거나 만료된 경우 PlayMCP 정책에 따라 HTTP `401 Unauthorized`를 반환할 것

“공모전 참가 MCP에서 카카오 로그인을 통한 프로필 연동을 명시적으로 승인한다”는 문구는 공식 공모전 안내에서 확인되지 않았다. 따라서 위 판단은 PlayMCP의 일반 OAuth 지원과 심사 정책을 조합한 **추론**이며, 제출 전에 [PlayMCP 개발자 문의 채널](https://kko.kakao.com/playmcp_discord)에 설계도를 보내 확인하는 것이 필요하다.

## 이 프로젝트에 대한 권고

### 예선 제출

현재처럼 사용자가 생년월일시ㆍ성별ㆍ출생지를 직접 입력하는 흐름을 유지한다.

이유:

- 이미 동작과 응답 품질이 검증됐다.
- 사용자 정보를 저장하지 않는 현재 범위를 유지할 수 있다.
- 프로필 연동을 해도 출생 시각과 출생지는 별도로 물어봐야 한다.
- OAuth 및 개인정보 심사가 추가되면 예선 제출 안정성과 일정에 불필요한 위험이 생긴다.

### 본선 진출 후 선택적 개선

Kakao Tools의 최종 런타임 명세와 심사 담당자의 답변을 받은 뒤, 다음과 같은 선택형 흐름을 검토한다.

1. `카카오 계정으로 입력 채우기`와 `직접 입력하기`를 함께 제공한다.
2. 동의한 사용자에게만 출생 연도ㆍ생일ㆍ성별을 채운다.
3. 출생 시각과 출생지는 반드시 사용자에게 확인한다.
4. 카카오계정 값도 사용자가 수정할 수 있게 한다.
5. 프로필 원본은 저장하지 않고 계산 직후 폐기한다. 인증 유지에 필요한 토큰을 저장해야 한다면 프로필 데이터와 분리하고 최소 기간만 보관한다.

이 방식은 편의성 개선 효과를 얻으면서도 카카오계정 정보의 누락ㆍ오류와 양력ㆍ음력 차이를 사용자가 교정할 수 있다.
