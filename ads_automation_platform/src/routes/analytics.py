from flask import Blueprint, request, jsonify
from src.models.performance import db, PerformanceData, PlatformAccount
from src.models.campaign import Campaign
from datetime import datetime, timedelta
from sqlalchemy import func, and_

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/performance', methods=['GET'])
def get_performance_data():
    """Obter dados de performance com filtros"""
    try:
        # Parâmetros de filtro
        campaign_id = request.args.get('campaign_id', type=int)
        platform = request.args.get('platform')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        user_id = request.args.get('user_id', 1, type=int)  # Placeholder
        
        # Query base
        query = PerformanceData.query
        
        # Aplicar filtros
        if campaign_id:
            query = query.filter(PerformanceData.campaign_id == campaign_id)
        
        if platform:
            query = query.filter(PerformanceData.platform == platform)
        
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(PerformanceData.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(PerformanceData.date <= end_date_obj)
        
        # Filtrar por campanhas do usuário
        if user_id:
            query = query.join(Campaign).filter(Campaign.user_id == user_id)
        
        performance_data = query.order_by(PerformanceData.date.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [data.to_dict() for data in performance_data]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/summary', methods=['GET'])
def get_performance_summary():
    """Obter resumo de performance agregado"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        days = request.args.get('days', 30, type=int)
        
        # Data de início
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Query agregada
        summary = db.session.query(
            func.sum(PerformanceData.impressions).label('total_impressions'),
            func.sum(PerformanceData.clicks).label('total_clicks'),
            func.sum(PerformanceData.conversions).label('total_conversions'),
            func.sum(PerformanceData.cost).label('total_cost'),
            func.sum(PerformanceData.revenue).label('total_revenue'),
            func.avg(PerformanceData.ctr).label('avg_ctr'),
            func.avg(PerformanceData.cpc).label('avg_cpc'),
            func.avg(PerformanceData.cpa).label('avg_cpa'),
            func.avg(PerformanceData.roas).label('avg_roas')
        ).join(Campaign).filter(
            and_(
                Campaign.user_id == user_id,
                PerformanceData.date >= start_date
            )
        ).first()
        
        # Calcular métricas derivadas
        total_impressions = summary.total_impressions or 0
        total_clicks = summary.total_clicks or 0
        total_cost = summary.total_cost or 0
        total_revenue = summary.total_revenue or 0
        
        overall_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        overall_cpc = (total_cost / total_clicks) if total_clicks > 0 else 0
        overall_roas = (total_revenue / total_cost) if total_cost > 0 else 0
        
        return jsonify({
            'success': True,
            'summary': {
                'total_impressions': total_impressions,
                'total_clicks': total_clicks,
                'total_conversions': summary.total_conversions or 0,
                'total_cost': total_cost,
                'total_revenue': total_revenue,
                'overall_ctr': round(overall_ctr, 2),
                'overall_cpc': round(overall_cpc, 2),
                'overall_roas': round(overall_roas, 2),
                'period_days': days
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/trends', methods=['GET'])
def get_performance_trends():
    """Obter tendências de performance ao longo do tempo"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        days = request.args.get('days', 30, type=int)
        metric = request.args.get('metric', 'cost')  # cost, clicks, impressions, conversions
        
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Query agrupada por data
        if metric == 'cost':
            metric_column = func.sum(PerformanceData.cost)
        elif metric == 'clicks':
            metric_column = func.sum(PerformanceData.clicks)
        elif metric == 'impressions':
            metric_column = func.sum(PerformanceData.impressions)
        elif metric == 'conversions':
            metric_column = func.sum(PerformanceData.conversions)
        else:
            metric_column = func.sum(PerformanceData.cost)
        
        trends = db.session.query(
            PerformanceData.date,
            metric_column.label('value')
        ).join(Campaign).filter(
            and_(
                Campaign.user_id == user_id,
                PerformanceData.date >= start_date
            )
        ).group_by(PerformanceData.date).order_by(PerformanceData.date).all()
        
        return jsonify({
            'success': True,
            'trends': [
                {
                    'date': trend.date.isoformat(),
                    'value': float(trend.value or 0)
                }
                for trend in trends
            ],
            'metric': metric
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/platform-comparison', methods=['GET'])
def get_platform_comparison():
    """Comparar performance entre plataformas"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        days = request.args.get('days', 30, type=int)
        
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Query agrupada por plataforma
        comparison = db.session.query(
            PerformanceData.platform,
            func.sum(PerformanceData.impressions).label('impressions'),
            func.sum(PerformanceData.clicks).label('clicks'),
            func.sum(PerformanceData.conversions).label('conversions'),
            func.sum(PerformanceData.cost).label('cost'),
            func.sum(PerformanceData.revenue).label('revenue')
        ).join(Campaign).filter(
            and_(
                Campaign.user_id == user_id,
                PerformanceData.date >= start_date
            )
        ).group_by(PerformanceData.platform).all()
        
        platform_data = []
        for platform in comparison:
            impressions = platform.impressions or 0
            clicks = platform.clicks or 0
            cost = platform.cost or 0
            revenue = platform.revenue or 0
            
            ctr = (clicks / impressions * 100) if impressions > 0 else 0
            cpc = (cost / clicks) if clicks > 0 else 0
            roas = (revenue / cost) if cost > 0 else 0
            
            platform_data.append({
                'platform': platform.platform,
                'impressions': impressions,
                'clicks': clicks,
                'conversions': platform.conversions or 0,
                'cost': cost,
                'revenue': revenue,
                'ctr': round(ctr, 2),
                'cpc': round(cpc, 2),
                'roas': round(roas, 2)
            })
        
        return jsonify({
            'success': True,
            'platforms': platform_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/top-campaigns', methods=['GET'])
def get_top_campaigns():
    """Obter campanhas com melhor performance"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        days = request.args.get('days', 30, type=int)
        metric = request.args.get('metric', 'roas')  # roas, conversions, clicks, revenue
        limit = request.args.get('limit', 10, type=int)
        
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Definir métrica de ordenação
        if metric == 'roas':
            order_column = func.avg(PerformanceData.roas).desc()
        elif metric == 'conversions':
            order_column = func.sum(PerformanceData.conversions).desc()
        elif metric == 'clicks':
            order_column = func.sum(PerformanceData.clicks).desc()
        elif metric == 'revenue':
            order_column = func.sum(PerformanceData.revenue).desc()
        else:
            order_column = func.avg(PerformanceData.roas).desc()
        
        # Query com join para obter dados da campanha
        top_campaigns = db.session.query(
            Campaign.id,
            Campaign.name,
            Campaign.platform,
            func.sum(PerformanceData.impressions).label('impressions'),
            func.sum(PerformanceData.clicks).label('clicks'),
            func.sum(PerformanceData.conversions).label('conversions'),
            func.sum(PerformanceData.cost).label('cost'),
            func.sum(PerformanceData.revenue).label('revenue'),
            func.avg(PerformanceData.roas).label('avg_roas')
        ).join(PerformanceData).filter(
            and_(
                Campaign.user_id == user_id,
                PerformanceData.date >= start_date
            )
        ).group_by(Campaign.id).order_by(order_column).limit(limit).all()
        
        campaigns_data = []
        for campaign in top_campaigns:
            campaigns_data.append({
                'id': campaign.id,
                'name': campaign.name,
                'platform': campaign.platform,
                'impressions': campaign.impressions or 0,
                'clicks': campaign.clicks or 0,
                'conversions': campaign.conversions or 0,
                'cost': campaign.cost or 0,
                'revenue': campaign.revenue or 0,
                'avg_roas': round(campaign.avg_roas or 0, 2)
            })
        
        return jsonify({
            'success': True,
            'campaigns': campaigns_data,
            'metric': metric
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

