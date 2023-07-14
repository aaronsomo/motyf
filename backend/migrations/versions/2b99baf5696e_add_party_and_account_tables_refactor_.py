"""Add party and account tables, refactor existing columns

Revision ID: 2b99baf5696e
Revises: 4cd9671a22bc
Create Date: 2022-11-07 19:07:46.502217

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b99baf5696e'
down_revision = '4cd9671a22bc'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('user', 'manual_kyc_id')
    op.drop_column('user', 'kyc_requested')
    op.create_table(
        'account',
        sa.Column('account_id', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('account_id'),
        sa.UniqueConstraint('account_id')
    )
    op.create_table(
        'party',
        sa.Column('party_id', sa.String(), nullable=False),
        sa.Column('kyc_request_id', sa.String(), nullable=True),
        sa.Column('kyc_requested', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('party_id'),
        sa.UniqueConstraint('party_id')
    )
    pass


def downgrade():
    op.add_column('user', sa.Column('manual_kyc_id', sa.String(), nullable=True))
    op.add_column('user', sa.Column('kyc_requested', sa.Boolean(), server_default='0', nullable=False))
    pass
