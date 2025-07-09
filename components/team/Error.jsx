
export default function Error({ message = "Failed to load team data" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-red-600 text-xl">{message}</div>
    </div>
  )
}