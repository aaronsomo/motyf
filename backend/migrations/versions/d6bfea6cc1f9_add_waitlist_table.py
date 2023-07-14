"""Add waitlist table

Revision ID: d6bfea6cc1f9
Revises: ded7d73dfd8d
Create Date: 2023-03-08 20:04:19.980086

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd6bfea6cc1f9'
down_revision = 'ded7d73dfd8d'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'waitlist',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    pass


def downgrade():
    op.drop_table('waitlist')
    pass
