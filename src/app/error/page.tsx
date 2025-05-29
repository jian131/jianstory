export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Có lỗi xảy ra
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Đã có lỗi trong quá trình xác thực. Vui lòng thử lại.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <a
            href="/login"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center transition-all duration-200 font-medium"
          >
            Quay lại đăng nhập
          </a>

          <a
            href="/"
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 text-center transition-all duration-200 font-medium"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  )
}
