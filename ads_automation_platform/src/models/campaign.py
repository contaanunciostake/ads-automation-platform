from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # 'google_ads', 'facebook_ads', 'linkedin_ads', 'tiktok_ads'
    platform_campaign_id = db.Column(db.String(255), nullable=True)  # ID da campanha na plataforma externa
    status = db.Column(db.String(50), default='draft')  # 'draft', 'active', 'paused', 'completed'
    budget = db.Column(db.Float, nullable=True)
    budget_type = db.Column(db.String(50), nullable=True)  # 'daily', 'total'
    objective = db.Column(db.String(100), nullable=True)  # 'traffic', 'conversions', 'brand_awareness', etc.
    target_audience = db.Column(db.Text, nullable=True)  # JSON string com dados de segmentação
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relacionamentos
    ad_groups = db.relationship('AdGroup', backref='campaign', lazy=True, cascade='all, delete-orphan')
    automation_rules = db.relationship('AutomationRule', backref='campaign', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'platform': self.platform,
            'platform_campaign_id': self.platform_campaign_id,
            'status': self.status,
            'budget': self.budget,
            'budget_type': self.budget_type,
            'objective': self.objective,
            'target_audience': json.loads(self.target_audience) if self.target_audience else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_id': self.user_id
        }

class AdGroup(db.Model):
    __tablename__ = 'ad_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    platform_ad_group_id = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='active')
    bid_amount = db.Column(db.Float, nullable=True)
    bid_strategy = db.Column(db.String(100), nullable=True)
    keywords = db.Column(db.Text, nullable=True)  # JSON string com palavras-chave
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    
    # Relacionamentos
    ads = db.relationship('Ad', backref='ad_group', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'platform_ad_group_id': self.platform_ad_group_id,
            'status': self.status,
            'bid_amount': self.bid_amount,
            'bid_strategy': self.bid_strategy,
            'keywords': json.loads(self.keywords) if self.keywords else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'campaign_id': self.campaign_id
        }

class Ad(db.Model):
    __tablename__ = 'ads'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    platform_ad_id = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='active')
    ad_type = db.Column(db.String(50), nullable=False)  # 'text', 'image', 'video', 'carousel'
    headline = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    creative_assets = db.Column(db.Text, nullable=True)  # JSON string com URLs de imagens/vídeos
    final_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ad_group_id = db.Column(db.Integer, db.ForeignKey('ad_groups.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'platform_ad_id': self.platform_ad_id,
            'status': self.status,
            'ad_type': self.ad_type,
            'headline': self.headline,
            'description': self.description,
            'creative_assets': json.loads(self.creative_assets) if self.creative_assets else None,
            'final_url': self.final_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'ad_group_id': self.ad_group_id
        }

class AutomationRule(db.Model):
    __tablename__ = 'automation_rules'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    rule_type = db.Column(db.String(50), nullable=False)  # 'bid_adjustment', 'pause_ad', 'budget_adjustment'
    conditions = db.Column(db.Text, nullable=False)  # JSON string com condições
    actions = db.Column(db.Text, nullable=False)  # JSON string com ações
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'rule_type': self.rule_type,
            'conditions': json.loads(self.conditions) if self.conditions else None,
            'actions': json.loads(self.actions) if self.actions else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'campaign_id': self.campaign_id
        }

