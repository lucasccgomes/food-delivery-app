const pallete = [
    {   // orange
        btPay: '#f8d8c1',
        text: '#f97316', 
        bgColor: opacity=> `rgba(251, 146, 60, ${opacity})`
    },
    {   // dark gray
        btPay: '#9fa5ae',
        text: '#334155', 
        bgColor: opacity=> `rgba(30, 41, 59, ${opacity})`,
    },
    { // pink
        btPay: '#fecae4',
        text: '#FF69B4',
        bgColor: opacity=> `rgba(255, 105, 180, ${opacity})`,
    },
    {   // purple
        btPay: '#c9b4ed',
        text: '#7c3aed', 
        bgColor: opacity=> `rgba(167, 139, 250, ${opacity})`,
    },
    {   // green
        btPay: '#84ac99',
        text: '#009950', 
        bgColor: opacity=> `rgba(0, 179, 89, ${opacity})`,
    },
    {
        // teal
        btPay: '#90c0bb',
        text: '#14b8a6',
        bgColor: opacity=> `rgba(45, 212, 191, ${opacity})`
    },
    {
        // red
        btPay: '#e69b9b',
        text: '#dc2626',
        bgColor: opacity=> `rgba(248, 113, 113, ${opacity})`
    }

]
export const themeColors = {
    ...pallete[2]
}