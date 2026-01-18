// components/Pembayaran/PaymentUtils.ts

export const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

export const mockUploadService = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(URL.createObjectURL(file)) 
        }, 1500)
    })
}

export const printReceipt = (payment: any) => {
    if (payment.status !== 'LUNAS') {
        alert("Struk hanya bisa dicetak untuk pembayaran LUNAS.")
        return
    }
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head><title>Struk Pembayaran</title></head>
                <body style="font-family: monospace; padding: 20px;">
                    <h2>MIRACLE PRIVATE</h2>
                    <hr/>
                    <p>Siswa: ${payment.students?.name || '-'}</p>
                    <p>Total: ${formatRupiah(payment.amount)}</p>
                    <script>window.print();</script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }
}