export const fetchData = async (url:string, setterFunction:Function, loaderFunction:Function) => { 
    try {
        loaderFunction(true);

        const res = await fetch(url);
        const data = await res.json();

        if(res?.status === 200) {
            setterFunction(data);
        } else if(res?.status === 401) {
            console.log("Unauthorized Access, Go to Login", res?.status);
        }else{
            console.log("Somthing went wrong with error", res?.status);
        }
        
    } catch (error) {
        console.error("error while fetching the data: ",error);
    } finally {
        loaderFunction(false)
    }
}