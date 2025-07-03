from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class PerformanceData(db.Model):
    __tablename__ = 'performance_data'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=True)
    ad_group_id = db.Column(db.Integer, db.ForeignKey('ad_groups.id'), nullable=True)
    ad_id = db.Column(db.Integer, db.ForeignKey('ads.id'), nullable=True)
    
    # Métricas principais
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    cost = db.Column(db.Float, default=0.0)
    revenue = db.Column(db.Float, default=0.0)
    
    # Métricas calculadas
    ctr = db.Column(db.Float, default=0.0)  # Click-through rate
    cpc = db.Column(db.Float, default=0.0)  # Cost per click
    cpa = db.Column(db.Float, default=0.0)  # Cost per acquisition
    roas = db.Column(db.Float, default=0.0)  # Return on ad spend
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'platform': self.platform,
            'campaign_id': self.campaign_id,
            'ad_group_id': self.ad_group_id,
            'ad_id': self.ad_id,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'cost': self.cost,
            'revenue': self.revenue,
            'ctr': self.ctr,
            'cpc': self.cpc,
            'cpa': self.cpa,
            'roas': self.roas,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PlatformAccount(db.Model):
    __tablename__ = 'platform_accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # 'google_ads', 'facebook_ads', etc.
    account_id = db.Column(db.String(255), nullable=False)  # ID da conta na plataforma
    account_name = db.Column(db.String(255), nullable=True)
    access_token = db.Column(db.Text, nullable=True)  # Token de acesso (criptografado)
    refresh_token = db.Column(db.Text, nullable=True)  # Token de refresh (criptografado)
    token_expires_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'platform': self.platform,
            'account_id': self.account_id,
            'account_name': self.account_name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

