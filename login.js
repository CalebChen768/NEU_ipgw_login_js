const studentID = "20001234"; 
const password = "12341234";
const ul = studentID.length;
const pl = password.length;

const url = "https://pass.neu.edu.cn/tpass/login?service=http%3A%2F%2Fipgw.neu.edu.cn%2Fsrun_portal_sso%3Fac_id%3D{acid}";
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0",
    "Connection": "close",
    "Host": "pass.neu.edu.cn",
    "Referer": url,
    "Origin": "https://pass.neu.edu.cn",
    "Upgrade-Insecure-Requests": "1"
};

async function fetchUrl(id) {
    try {
        // Fetch the page
        let response = await fetch(url.replace("{acid}",id), { headers });
        let text = await response.text();
        let cookies = response.headers.get('Set-Cookie'); // Note: Access to cookies may be restricted

        // Extract 'lt' and 'execution' values
        const ltExecutionRegex = /name="lt" value="(.*?)".*\sname="execution" value="(.*?)"/s;
        let matches = ltExecutionRegex.exec(text);
        let lt = matches[1];
        let execution = matches[2];

        // Form data for the POST request
        let payload = new URLSearchParams({
            "rsa": studentID + password + lt,
            "ul": ul,
            "pl": pl,
            "lt": lt,
            "execution": execution,
            "_eventId": "submit"
        });

        // Make a POST request
        response = await fetch(url, {
            method: 'POST',
            headers: {
                ...headers,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookies
            },
            body: payload,
            redirect: 'manual', // Do not automatically follow redirects
            credentials: 'include' // Include credentials
        });

        // Fetch redirected URL
        const location = response.headers.get('Location');
        const modifiedLocation = location.replace('http://ipgw.neu.edu.cn/', 'http://ipgw.neu.edu.cn/v1/');
        response = await fetch(modifiedLocation, {
            headers,
            credentials: 'include'
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


// Call the function
// acid => 15: 无线网, 1: 有线网
for (let id of [15,1]){
    fetchUrl(id);
}
