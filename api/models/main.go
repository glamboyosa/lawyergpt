package models

import (
	"math/rand"
	"time"

	"github.com/oklog/ulid/v2"
	"gorm.io/gorm"

	"github.com/pgvector/pgvector-go"
)

type PostgresVector []float32

// Resource struct
type Resource struct {
	ID        string    `gorm:"type:varchar(191);primaryKey"`
	Filename  *string   `gorm:"type:varchar(255)"`
	URL       *string   `gorm:"type:varchar(255)"`
	Content   string    `gorm:"type:text;not null"`
	CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP;ON UPDATE CURRENT_TIMESTAMP"`
}

// Embedding struct
type Embedding struct {
	ID         string          `gorm:"type:varchar(191);primaryKey"`
	ResourceID string          `gorm:"type:varchar(191);index"`
	Resource   Resource        `gorm:"foreignKey:ResourceID;constraint:OnDelete:CASCADE"`
	Content    string          `gorm:"type:text;not null"`
	Embedding  pgvector.Vector `gorm:"type:vector;not null"`
	CreatedAt  time.Time       `gorm:"not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time       `gorm:"not null;default:CURRENT_TIMESTAMP;ON UPDATE CURRENT_TIMESTAMP"`
}

// BeforeCreate hooks to assign UUIDv7-like IDs
func (r *Resource) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == "" {
		r.ID = generateUUIDv7("resource_")
	}
	return nil
}

func (e *Embedding) BeforeCreate(tx *gorm.DB) (err error) {
	if e.ID == "" {
		e.ID = generateUUIDv7("embedding_")
	}
	return nil
}

// Generate UUIDv7-like ID with prefix
func generateUUIDv7(prefix string) string {
	t := time.Now().UnixMilli()
	entropy := ulid.Monotonic(rand.New(rand.NewSource(t)), 0)
	id := ulid.MustNew(ulid.Timestamp(time.Now()), entropy)

	return prefix + id.String()
}
