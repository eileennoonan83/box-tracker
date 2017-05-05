export class User {

    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    userName: string;

    get fullName() {
        return this.firstName + " " + this.lastName;
    }

    public static make = function(data) {
        let user = new User;

        user.email = data.email;
        user.password = data.password;
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.phone = data.phone;
        user.userName = data.userName;
        
        return user;
    }
}
