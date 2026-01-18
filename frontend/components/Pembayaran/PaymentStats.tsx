import { CreditCard, CheckCircle, X } from 'lucide-react'
import { formatRupiah } from './PaymentUtils'

export const PaymentStats = ({ stats }: { stats: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<CreditCard size={24}/>} label="Total Pemasukan" value={formatRupiah(stats.total_uang)} color="green" />
        <StatCard icon={<CheckCircle size={24}/>} label="Transaksi Lunas" value={`${stats.total_lunas} Transaksi`} color="blue" />
        <StatCard icon={<X size={24}/>} label="Belum Lunas" value={`${stats.total_pending} Murid`} color="red" />
    </div>
)

const StatCard = ({ icon, label, value, color }: any) => {
    const colors: any = {
        green: "bg-green-100 text-green-600",
        blue: "bg-blue-100 text-blue-600",
        red: "bg-red-100 text-red-600"
    }
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className={`p-3 rounded-full ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    )
}