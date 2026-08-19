-- 当天诊断快照：同一门店 + 同一天只允许一条记录
CREATE TABLE IF NOT EXISTS diagnosis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL,
  diagnosis_date DATE NOT NULL,
  diagnosis_result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, diagnosis_date)
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_snapshots_store_date
  ON diagnosis_snapshots (store_id, diagnosis_date);
