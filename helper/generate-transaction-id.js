const generateTransactionId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();

    return `TRX-${year}${month}${day}${hours}${minutes}${seconds}-${randomPart}`;
}

module.exports = generateTransactionId;