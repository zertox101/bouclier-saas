"""add_organization_table

Revision ID: 001
Revises: 
Create Date: 2026-06-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'organizations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('plan', sa.String(), nullable=False, server_default='FREE'),
        sa.Column('stripe_customer_id', sa.String(), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(), nullable=True),
        sa.Column('subscription_status', sa.String(), nullable=False, server_default='INACTIVE'),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )
    op.create_index('idx_organizations_slug', 'organizations', ['slug'], unique=True)


def downgrade() -> None:
    op.drop_index('idx_organizations_slug', table_name='organizations')
    op.drop_table('organizations')