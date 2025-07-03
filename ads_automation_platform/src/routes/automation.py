from flask import Blueprint, request, jsonify
from src.models.campaign import db
from src.services.automation_engine import AutomationEngine, OptimizationEngine
from datetime import datetime

automation_bp = Blueprint('automation', __name__)

@automation_bp.route('/automation/execute', methods=['POST'])
def execute_automation():
    """Executar regras de automação"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)  # Placeholder
        
        # Criar instância do motor de automação
        automation_engine = AutomationEngine(db.session)
        
        # Executar regras de automação
        results = automation_engine.execute_automation_rules(user_id)
        
        # Calcular estatísticas
        total_rules = len(results)
        successful_rules = len([r for r in results if r.get('success')])
        total_actions = sum(len(r.get('actions_taken', [])) for r in results)
        
        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'total_rules_executed': total_rules,
                'successful_rules': successful_rules,
                'total_actions_taken': total_actions,
                'execution_time': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@automation_bp.route('/automation/optimize', methods=['POST'])
def optimize_campaigns():
    """Gerar recomendações de otimização para campanhas"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        days_back = data.get('days_back', 30)
        
        # Criar instância do motor de otimização
        optimization_engine = OptimizationEngine(db.session)
        
        # Gerar recomendações
        recommendations = optimization_engine.optimize_campaigns(user_id, days_back)
        
        # Agrupar recomendações por prioridade
        high_priority = [r for r in recommendations if r.get('priority') == 'high']
        medium_priority = [r for r in recommendations if r.get('priority') == 'medium']
        low_priority = [r for r in recommendations if r.get('priority') == 'low']
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'summary': {
                'total_recommendations': len(recommendations),
                'high_priority': len(high_priority),
                'medium_priority': len(medium_priority),
                'low_priority': len(low_priority),
                'analysis_period_days': days_back,
                'generated_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@automation_bp.route('/automation/rules/test', methods=['POST'])
def test_automation_rule():
    """Testar uma regra de automação sem executá-la"""
    try:
        data = request.get_json()
        campaign_id = data.get('campaign_id')
        conditions = data.get('conditions', [])
        
        if not campaign_id:
            return jsonify({'success': False, 'error': 'campaign_id é obrigatório'}), 400
        
        # Criar instância do motor de automação
        automation_engine = AutomationEngine(db.session)
        
        # Testar condições
        conditions_met = automation_engine._check_conditions(campaign_id, conditions)
        
        # Buscar dados de performance para contexto
        from src.models.campaign import Campaign
        from src.models.performance import PerformanceData
        from datetime import timedelta
        from sqlalchemy import and_
        
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'success': False, 'error': 'Campanha não encontrada'}), 404
        
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=7)
        
        performance_data = PerformanceData.query.filter(
            and_(
                PerformanceData.campaign_id == campaign_id,
                PerformanceData.date >= start_date,
                PerformanceData.date <= end_date
            )
        ).all()
        
        # Calcular métricas atuais
        if performance_data:
            total_impressions = sum(p.impressions for p in performance_data)
            total_clicks = sum(p.clicks for p in performance_data)
            total_conversions = sum(p.conversions for p in performance_data)
            total_cost = sum(p.cost for p in performance_data)
            total_revenue = sum(p.revenue for p in performance_data)
            
            current_metrics = {
                'ctr': (total_clicks / total_impressions * 100) if total_impressions > 0 else 0,
                'cpc': (total_cost / total_clicks) if total_clicks > 0 else 0,
                'roas': (total_revenue / total_cost) if total_cost > 0 else 0,
                'conversions': total_conversions,
                'cost': total_cost,
                'impressions': total_impressions,
                'clicks': total_clicks
            }
        else:
            current_metrics = {}
        
        return jsonify({
            'success': True,
            'campaign_name': campaign.name,
            'conditions_met': conditions_met,
            'current_metrics': current_metrics,
            'test_period': f'{start_date} to {end_date}',
            'would_execute': conditions_met
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@automation_bp.route('/automation/schedule', methods=['POST'])
def schedule_automation():
    """Agendar execução automática de regras de automação"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 1)
        frequency = data.get('frequency', 'daily')  # daily, hourly, weekly
        enabled = data.get('enabled', True)
        
        # Aqui seria implementada a lógica de agendamento
        # Por exemplo, usando Celery, APScheduler ou similar
        
        return jsonify({
            'success': True,
            'message': f'Automação agendada para execução {frequency}',
            'user_id': user_id,
            'frequency': frequency,
            'enabled': enabled,
            'next_execution': 'Implementar lógica de agendamento'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@automation_bp.route('/automation/history', methods=['GET'])
def get_automation_history():
    """Obter histórico de execuções de automação"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        # Aqui seria implementada a consulta ao histórico de execuções
        # Por enquanto, retornamos dados simulados
        
        history = [
            {
                'id': 1,
                'executed_at': '2024-07-01T10:00:00Z',
                'rules_executed': 5,
                'actions_taken': 3,
                'campaigns_affected': ['Campanha Black Friday 2024', 'Promoção Verão'],
                'status': 'completed'
            },
            {
                'id': 2,
                'executed_at': '2024-06-30T10:00:00Z',
                'rules_executed': 5,
                'actions_taken': 1,
                'campaigns_affected': ['LinkedIn B2B Campaign'],
                'status': 'completed'
            }
        ]
        
        return jsonify({
            'success': True,
            'history': history[:limit],
            'total_executions': len(history)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@automation_bp.route('/automation/insights', methods=['GET'])
def get_automation_insights():
    """Obter insights sobre o impacto da automação"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        days_back = request.args.get('days_back', 30, type=int)
        
        # Dados simulados de insights
        insights = {
            'cost_savings': {
                'amount': 2450.00,
                'percentage': 12.5,
                'description': 'Economia gerada pela automação de pausas e ajustes de lance'
            },
            'performance_improvements': {
                'roas_improvement': 0.8,
                'ctr_improvement': 0.3,
                'conversion_rate_improvement': 1.2,
                'description': 'Melhorias médias nas métricas principais'
            },
            'time_saved': {
                'hours_per_week': 8.5,
                'tasks_automated': 45,
                'description': 'Tempo economizado em tarefas manuais'
            },
            'top_performing_rules': [
                {
                    'name': 'Pausar anúncios com baixo desempenho',
                    'executions': 12,
                    'impact_score': 8.5,
                    'cost_saved': 890.00
                },
                {
                    'name': 'Aumentar orçamento para campanhas de alto ROAS',
                    'executions': 8,
                    'impact_score': 9.2,
                    'revenue_generated': 3200.00
                }
            ]
        }
        
        return jsonify({
            'success': True,
            'insights': insights,
            'period_days': days_back,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

