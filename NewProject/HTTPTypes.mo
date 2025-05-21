module HTTPTypes {
    public type HttpRequest = {
        url : Text;
        method : Text;
        headers : [(Text, Text)];
        body : Blob;
        certificate : ?Blob;
    };

    public type HttpResponse = {
        status_code : Nat16;
        headers : [(Text, Text)];
        body : Blob;
    };

};
