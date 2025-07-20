export class UserResponse {
    _id: string;
    nom: string;
    email: string;
    token: string;

    constructor(user:any) {
        this._id = user._id;
        this.nom = user.nom;
        this.email = user.email;
        this.token = user.token;
    }

    toJSON() {
        return {
            id: this._id,
            nom: this.nom,
            email: this.email,
            token: this.token
        };
    }
}