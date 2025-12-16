import json
import os
from typing import Dict, Any, List
from urllib import request, parse, error
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Получает актуальные спортивные события и котировки из The Odds API
    Args: event - dict с httpMethod, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: JSON с матчами и коэффициентами
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('ODDS_API_KEY', '')
    
    if not api_key:
        mock_data = get_mock_data()
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(mock_data),
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    sport = query_params.get('sport', 'soccer_epl')
    
    api_url = f'https://api.the-odds-api.com/v4/sports/{sport}/odds/'
    params = {
        'apiKey': api_key,
        'regions': 'eu',
        'markets': 'h2h',
        'oddsFormat': 'decimal'
    }
    
    url = f"{api_url}?{parse.urlencode(params)}"
    
    req = request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        formatted_matches = format_matches(data)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'matches': formatted_matches,
                'count': len(formatted_matches),
                'timestamp': datetime.utcnow().isoformat()
            }),
            'isBase64Encoded': False
        }
    
    except error.HTTPError as e:
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'API error: {e.reason}',
                'fallback': get_mock_data()
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'fallback': get_mock_data()
            }),
            'isBase64Encoded': False
        }


def format_matches(raw_data: List[Dict]) -> List[Dict[str, Any]]:
    formatted = []
    
    for game in raw_data[:10]:
        if not game.get('bookmakers'):
            continue
            
        bookmaker = game['bookmakers'][0]
        market = bookmaker.get('markets', [{}])[0]
        outcomes = market.get('outcomes', [])
        
        if len(outcomes) < 2:
            continue
        
        home_team = game.get('home_team', 'Team 1')
        away_team = game.get('away_team', 'Team 2')
        
        odds = {
            'win1': outcomes[0].get('price', 2.0),
            'win2': outcomes[1].get('price', 2.0)
        }
        
        if len(outcomes) > 2:
            odds['draw'] = outcomes[2].get('price', 3.0)
        
        commence_time = game.get('commence_time', '')
        is_live = False
        time_str = 'Скоро'
        
        if commence_time:
            try:
                game_time = datetime.fromisoformat(commence_time.replace('Z', '+00:00'))
                now = datetime.utcnow()
                
                if game_time < now:
                    is_live = True
                    time_str = '45\''
                else:
                    time_str = game_time.strftime('%H:%M')
            except:
                time_str = 'Скоро'
        
        formatted.append({
            'id': hash(game.get('id', '')),
            'sport': get_sport_emoji(game.get('sport_key', '')),
            'league': game.get('sport_title', 'Спорт'),
            'team1': home_team,
            'team2': away_team,
            'time': time_str,
            'isLive': is_live,
            'odds': odds
        })
    
    return formatted


def get_sport_emoji(sport_key: str) -> str:
    emoji_map = {
        'soccer': '⚽',
        'basketball': '🏀',
        'americanfootball': '🏈',
        'baseball': '⚾',
        'icehockey': '🏒',
        'tennis': '🎾',
        'cricket': '🏏',
        'rugbyleague': '🏉'
    }
    
    for key, emoji in emoji_map.items():
        if key in sport_key.lower():
            return emoji
    
    return '⚽'


def get_mock_data() -> Dict[str, Any]:
    return {
        'matches': [
            {
                'id': 1,
                'sport': '⚽',
                'league': 'Премьер-лига',
                'team1': 'Манчестер Сити',
                'team2': 'Ливерпуль',
                'score1': 2,
                'score2': 1,
                'time': '67\'',
                'isLive': True,
                'odds': {'win1': 1.85, 'draw': 3.40, 'win2': 4.20}
            },
            {
                'id': 2,
                'sport': '🏀',
                'league': 'NBA',
                'team1': 'Лейкерс',
                'team2': 'Уорриорз',
                'score1': 88,
                'score2': 92,
                'time': 'Q3 8:45',
                'isLive': True,
                'odds': {'win1': 2.10, 'win2': 1.70}
            },
            {
                'id': 3,
                'sport': '🎾',
                'league': 'Australian Open',
                'team1': 'Медведев Д.',
                'team2': 'Алькарас К.',
                'score1': 2,
                'score2': 1,
                'time': 'Сет 3',
                'isLive': True,
                'odds': {'win1': 1.55, 'win2': 2.40}
            }
        ],
        'count': 3,
        'timestamp': datetime.utcnow().isoformat(),
        'mode': 'mock'
    }
