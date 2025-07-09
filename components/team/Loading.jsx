
export default function Loading({ message = "Loading team data..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-blue-800 text-xl">{message}</div>
    </div>
  )
}