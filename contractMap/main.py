import os
import asyncio
import sys
import json
import requests
import aiohttp
from datetime import date, timedelta, datetime, timezone

# 1. 설정
KAKAO_API_KEY = os.getenv('KAKAO_API_KEY')
CACHE_FILE_PATH = 'contractMap/address_cache.json' # 캐시 파일 경로

# 전역 캐시 저장소 (주소: (장소명, 위도, 경도))
ADDRESS_CACHE = {}

# -------------------- HTTP 요청 -------------------- #
async def fetch_post(session, url, data=None, json_body=None, headers=None):
    try:
        kwargs = {"timeout": 10}
        if headers:
            kwargs["headers"] = headers

        if json_body is not None:
            kwargs["json"] = json_body
        elif data is not None:
            kwargs["data"] = data

        async with session.post(url, **kwargs) as response:
            return await response.text()
    except Exception as e:
        return f"ERROR:{str(e)}"


# 2. 카카오 좌표 변환 함수 (캐시 적용)
async def get_lat_lon(session, address):
    # 1. 캐시에 있는지 먼저 확인 (메모리 조회)
    if address in ADDRESS_CACHE:
        return ADDRESS_CACHE[address]

    # 캐시에 없으면 API 호출 진행
    url = 'https://dapi.kakao.com/v2/local/search/keyword.json'
    headers = {'Authorization': f'KakaoAK {KAKAO_API_KEY}'}

    try:    
        query = f"서울시 {address}"
        result = await fetch_post(session, url, data={'query': query}, headers=headers)
        data = json.loads(result)
        
        if data['documents']:
            documents = [x for x in data['documents'] if '아파트' in x['category_name']]
            if len(documents) == 0:
                documents = [x for x in data['documents'] if '주거시설' in x['category_name']]
            if len(documents) == 0:
                documents = [x for x in data['documents'] if '부동산' in x['category_name']]

            if len(documents) == 0:
                documents = data['documents']

            if len(documents) > 0:
                doc = documents[0]
                place_name = doc['place_name'] if 'place_name' in doc else None
                lat = doc['y']
                lng = doc['x']
                
            # 2. 캐시에 저장
            result_tuple = (place_name, lat, lng)
            ADDRESS_CACHE[address] = result_tuple
                
            return result_tuple
    except:
        pass
    
    return None, None, None

async def main():
    # [NEW] 시작 시 기존 캐시 파일 로드
    global ADDRESS_CACHE
    if os.path.exists(CACHE_FILE_PATH):
        try:
            with open(CACHE_FILE_PATH, 'r', encoding='utf-8') as f:
                ADDRESS_CACHE = json.load(f)
            print(f"기존 캐시 로드 완료: {len(ADDRESS_CACHE)}개 주소")
        except Exception as e:
            print(f"캐시 파일 로드 실패 (새로 시작): {e}")
            ADDRESS_CACHE = {}
    else:
        print("기존 캐시 파일 없음. 새로 시작합니다.")

    seoul = [{'code': '11110', 'eng_name': 'Jongno-gu', 'kor_name': '종로구'}, {'code': '11140', 'eng_name': 'Jung-gu', 'kor_name': '중구'}, {'code': '11170', 'eng_name': 'Yongsan-gu', 'kor_name': '용산구'}, {'code': '11200', 'eng_name': 'Seongdong-gu', 'kor_name': '성동구'}, {'code': '11215', 'eng_name': 'Gwangjin-gu', 'kor_name': '광진구'}, {'code': '11230', 'eng_name': 'Dongdaemun-gu', 'kor_name': '동대문구'}, {'code': '11260', 'eng_name': 'Jungnang-gu', 'kor_name': '중랑구'}, {'code': '11290', 'eng_name': 'Seongbuk-gu', 'kor_name': '성북구'}, {'code': '11305', 'eng_name': 'Gangbuk-gu', 'kor_name': '강북구'}, {'code': '11320', 'eng_name': 'Dobong-gu', 'kor_name': '도봉구'}, {'code': '11350', 'eng_name': 'Nowon-gu', 'kor_name': '노원구'}, {'code': '11380', 'eng_name': 'Eunpyeong-gu', 'kor_name': '은평구'}, {'code': '11410', 'eng_name': 'Seodaemun-gu', 'kor_name': '서대문구'}, {'code': '11440', 'eng_name': 'Mapo-gu', 'kor_name': '마포구'}, {'code': '11470', 'eng_name': 'Yangcheon-gu', 'kor_name': '양천구'}, {'code': '11500', 'eng_name': 'Gangseo-gu', 'kor_name': '강서구'}, {'code': '11530', 'eng_name': 'Guro-gu', 'kor_name': '구로구'}, {'code': '11545', 'eng_name': 'Geumcheon-gu', 'kor_name': '금천구'}, {'code': '11560', 'eng_name': 'Yeongdeungpo-gu', 'kor_name': '영등포구'}, {'code': '11590', 'eng_name': 'Dongjak-gu', 'kor_name': '동작구'}, {'code': '11620', 'eng_name': 'Gwanak-gu', 'kor_name': '관악구'}, {'code': '11650', 'eng_name': 'Seocho-gu', 'kor_name': '서초구'}, {'code': '11680', 'eng_name': 'Gangnam-gu', 'kor_name': '강남구'}, {'code': '11710', 'eng_name': 'Songpa-gu', 'kor_name': '송파구'}, {'code': '11740', 'eng_name': 'Gangdong-gu', 'kor_name': '강동구'}]

    async with aiohttp.ClientSession() as session:
        url = "https://land.seoul.go.kr/land/wsklis/getContractList.do"
        today = date.today()
        before_60_days = today - timedelta(days=60)
        today_str = today.strftime("%Y%m%d")
        before_60_days_str = before_60_days.strftime("%Y%m%d")
        
        data = []
        
        api_call_count = 0
        cache_hit_count = 0

        for sggCd in seoul:
            data_payload = {"sggCd": sggCd["code"], "beginDate": before_60_days_str, "endDate": today_str}
            result = await fetch_post(session, url, data=data_payload)

            content = json.loads(result) if result else None
            if content and "result" in content:
                for x in content["result"]:
                    if x["USE_PURP"] != "주거용": continue

                    if x["ADDRESS"] in ADDRESS_CACHE:
                        cache_hit_count += 1
                    else:
                        api_call_count += 1

                    place_name, lat, lng = await get_lat_lon(session, x["ADDRESS"])
                    if place_name and lat and lng:
                        data.append({"address": x["ADDRESS"], "place_name": place_name, "lat": lat, "lng": lng, "date": x["HNDL_YMD"], "sggCd": x["SGG_CD"]})

        print(f"작업 완료: API 호출 {api_call_count}회, 캐시 사용 {cache_hit_count}회")

        os.makedirs('contractMap', exist_ok=True)
        
        # 1. 데이터 파일 저장
        output = {"last_updated": (datetime.now(timezone.utc) + timedelta(hours=9)).strftime("%Y-%m-%d %H:%M:%S"), "data": data}
        with open('contractMap/data.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        # [NEW] 2. 업데이트된 캐시 파일 저장 (다음 실행을 위해)
        with open(CACHE_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(ADDRESS_CACHE, f, ensure_ascii=False, indent=2)
            print(f"캐시 파일 저장 완료: {CACHE_FILE_PATH}")

# -------------------- 실행 -------------------- #
if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
