export default function Loading() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '4px solid #e5e7eb',
            borderTopColor: '#111827',
            margin: '0 auto 12px',
            animation: 'spin 1s linear infinite'
          }}
        />
        <p>Loading…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

