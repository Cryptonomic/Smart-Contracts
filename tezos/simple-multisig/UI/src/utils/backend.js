

export const addTransfer = async (t) => {

    try {
        const response = await fetch('http://localhost:3002/transfer/', {
            method: 'POST',
            body: JSON.stringify(t),
            headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const result = await response.json();

        //console.log('result is: ', JSON.stringify(result, null, 4));
        return result;
        
        } catch (err) {

            alert(err.toString());
        
        }
}