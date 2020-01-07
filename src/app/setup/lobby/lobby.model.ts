
export class LobbyMessage {
    socket_id: string;
    message_id: number;
    sender: UserDetailModel;
    data: any;

    public constructor(init?:Partial<LobbyMessage>) {
        Object.assign(this, init);
    }
}

export enum LobbyMessageEnum {
    LobbyUser = 1,
    JoinGameRequest,
    RequestStatus,
    UserDisconnected,
    AcceptRequest,
    RejectRequest
}

export class UserDetailModel {
    username: string;
    socket_id: string;
    render_peer_id: string;
    data_peer_id: string;
    cam_peer_id: string;

    public constructor(init?:Partial<UserDetailModel>) {
        Object.assign(this, init);
    }
};

export class GameModel {
    Name: string;
    Description: string;
    CoverUrl: string;
    RomUrl: string;
}

export class GameRequestModel {
    local_user_name: string;
    game: GameModel;
    recipient: UserDetailModel;
    requester: UserDetailModel;    

    public constructor(init?:Partial<GameRequestModel>) {
        Object.assign(this, init);
    }

    public local_user(): UserDetailModel {
        return this.recipient.username == this.local_user_name ? this.recipient : this.requester;
    }

    public remote_user(): UserDetailModel {
        return this.recipient.username != this.local_user_name ? this.recipient : this.requester;        
    }
}