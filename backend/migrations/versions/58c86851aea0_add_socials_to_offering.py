"""Add socials to offering

Revision ID: 58c86851aea0
Revises: 5a8d4349c042
Create Date: 2023-03-01 19:50:58.147382

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '58c86851aea0'
down_revision = '5a8d4349c042'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('offering', sa.Column('website', sa.String(), nullable=True))
    op.add_column('offering', sa.Column('discord', sa.String(), nullable=True))
    op.add_column('offering', sa.Column('social', sa.String(), nullable=True))
    pass


def downgrade():
    op.drop_column('offering', 'website')
    op.drop_column('offering', 'discord')
    op.drop_column('offering', 'social')
    pass
