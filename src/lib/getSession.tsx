
import Cookies from "js-cookie"
export const token = Cookies.get("token")
export const user_data = Cookies.get("user_data")

export const getUserData = () => {
    if (user_data) {
        const jsonData = JSON.parse(user_data)
        return jsonData;
    }
}

export const removeCookieLogout = () => {
    Cookies.remove("user_data")
    Cookies.remove("token")
}
