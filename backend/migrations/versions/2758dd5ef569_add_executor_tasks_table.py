"""Add executor tasks table

Revision ID: 2758dd5ef569
Revises: d6bfea6cc1f9
Create Date: 2023-03-09 19:06:30.668450

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2758dd5ef569'
down_revision = 'd6bfea6cc1f9'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'order_executor_tasks',
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('shell_command', sa.Text(), nullable=False),
        sa.Column('run_interval', sa.Interval(), nullable=False),
        sa.Column('last_run_at', sa.DateTime()),
        sa.Column('failed_run_attempts', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('name')
    )
    pass


def downgrade():
    op.drop_table('order_executor_tasks')
    pass
