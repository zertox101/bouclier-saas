"""add_org_id_and_seed

Revision ID: 002
Revises: 001
Create Date: 2026-06-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'


def upgrade() -> None:
    DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'
    
    # Tables that already have org_id column (from earlier migrations)
    existing_org_id_tables = {
        'users', 'assets', 'audit_logs', 'playbooks', 'correlation_rules',
        'findings', 'investigation_notes', 'pentest_missions', 'playbook_executions',
        'scan_jobs', 'security_events', 'soc_incidents', 'sql_connectors',
        'telemetry_counters', 'telemetry_events', 'telemetry_sensors',
        'threat_hunts', 'threat_intelligence', 'alert_priorities', 'appsec_sessions',
        'academy_artifacts', 'academy_audit_events', 'academy_cohorts',
        'academy_courses', 'academy_events', 'academy_lab_sessions',
        'academy_labs', 'academy_lessons', 'academy_modules',
        'academy_quiz_attempts', 'academy_quiz_questions', 'academy_writeups'
    }
    
    # Tables that need org_id column added
    tables_needing_org_id = [
        'incidents', 'correlated_alerts', 'ml_alerts', 'event_logs',
        'alert_events', 'traffic_stats'
    ]
    
    # All tables that should have org_id
    all_org_tables = list(existing_org_id_tables) + tables_needing_org_id
    
    # 1. Insert default organization
    op.execute(f"""
        INSERT INTO organizations (id, name, slug, plan, subscription_status, settings)
        VALUES ('{DEFAULT_ORG_ID}', 'Bouclier Enterprise', 'bouclier-enterprise', 'ENTERPRISE', 'ACTIVE', '{{}}')
        ON CONFLICT (id) DO NOTHING
    """)
    
    # 2. Update users with org_id='default' to point to default organization
    op.execute(f"UPDATE users SET org_id = '{DEFAULT_ORG_ID}' WHERE org_id = 'default' OR org_id IS NULL")
    
    # 3. Add org_id column to tables that need it
    for table in tables_needing_org_id:
        op.add_column(table, sa.Column('org_id', sa.String(), nullable=True))
        op.execute(f"UPDATE {table} SET org_id = '{DEFAULT_ORG_ID}' WHERE org_id IS NULL")
    
    # 4. Backfill org_id for existing tables - replace 'default' with actual org_id
    for table in existing_org_id_tables:
        op.execute(f"UPDATE {table} SET org_id = '{DEFAULT_ORG_ID}' WHERE org_id IS NULL OR org_id = 'default'")
    
    # 5. Create indexes on org_id for all tables
    for table in all_org_tables:
        op.create_index(f'idx_{table}_org_id', table, ['org_id'])
    
    # 6. Add foreign keys to organizations table
    for table in all_org_tables:
        op.create_foreign_key(
            f'fk_{table}_org_id', table, 'organizations',
            ['org_id'], ['id']
        )
    
    # 7. Make org_id NOT NULL on critical tables
    critical_tables = ['users', 'incidents', 'assets', 'playbooks', 'audit_logs']
    for table in critical_tables:
        op.alter_column(table, 'org_id', nullable=False)
    
    # 8. Map old roles to new roles
    op.execute("""
        UPDATE users SET role = CASE 
            WHEN role = 'admin' THEN 'ORG_ADMIN'
            WHEN role = 'super_admin' THEN 'SUPER_ADMIN'
            ELSE 'ANALYST'
        END
    """)
    
    # 3. Seed default organization
    op.execute(f"""
        INSERT INTO organizations (id, name, slug, plan, subscription_status, settings)
        VALUES ('{DEFAULT_ORG_ID}', 'Bouclier Enterprise', 'bouclier-enterprise', 'ENTERPRISE', 'ACTIVE', '{{}}')
        ON CONFLICT (id) DO NOTHING
    """)
    
    # 4. Migrate existing users - assign to default org
    op.execute(f"UPDATE users SET org_id = '{DEFAULT_ORG_ID}' WHERE org_id IS NULL")
    
    # 5. Map old roles to new roles
    op.execute("""
        UPDATE users SET role = CASE 
            WHEN role = 'admin' THEN 'ORG_ADMIN'
            WHEN role = 'super_admin' THEN 'SUPER_ADMIN'
            ELSE 'ANALYST'
        END
    """)
    
    # 6. Backfill org_id on existing data
    for table in tables:
        if table != 'users':  # users already done
            op.execute(f"UPDATE {table} SET org_id = '{DEFAULT_ORG_ID}' WHERE org_id IS NULL")
    
    # 7. Make org_id NOT NULL on critical tables
    critical_tables = ['users', 'incidents', 'assets', 'reports', 'playbooks']
    for table in critical_tables:
        op.alter_column(table, 'org_id', nullable=False)


def downgrade() -> None:
    all_org_tables = [
        'users', 'assets', 'incidents', 'playbooks',
        'correlated_alerts', 'ml_alerts', 'audit_logs',
        'event_logs', 'alert_events', 'traffic_stats',
        'alert_priorities', 'appsec_sessions', 'correlation_rules',
        'findings', 'investigation_notes', 'pentest_missions',
        'playbook_executions', 'scan_jobs', 'security_events',
        'soc_incidents', 'sql_connectors', 'telemetry_counters',
        'telemetry_events', 'telemetry_sensors', 'threat_hunts',
        'threat_intelligence', 'academy_artifacts', 'academy_audit_events',
        'academy_cohorts', 'academy_courses', 'academy_events',
        'academy_lab_sessions', 'academy_labs', 'academy_lessons',
        'academy_modules', 'academy_quiz_attempts', 'academy_quiz_questions',
        'academy_writeups'
    ]
    
    for table in all_org_tables:
        op.drop_constraint(f'fk_{table}_org_id', table, type_='foreignkey')
        op.drop_index(f'idx_{table}_org_id', table_name=table)
    
    op.drop_table('organizations')
    
    # Drop organization table
    op.drop_index('idx_organizations_slug', table_name='organizations')
    op.drop_table('organizations')