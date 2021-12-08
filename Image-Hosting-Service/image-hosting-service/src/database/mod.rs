table! {
    EditorContent (Id) {
        Id -> Integer,
        ContentId -> Char,
        LastModifiedBy -> Integer,
        LastModifiedDate -> Timestamp,
        Content -> Varchar,
    }
}

table! {
    Images (Id) {
        Id -> Char,
        ImageData -> Longtext,
        Description -> Char,
        Hidden -> Bool,
    }
}

table! {
    Users (Id) {
        Id -> Integer,
        Email -> Varchar,
        FirstName -> Varchar,
        LastName -> Varchar,
        PassHash -> Varchar,
        Active -> Bool,
    }
}

joinable!(EditorContent -> Users (LastModifiedBy));

allow_tables_to_appear_in_same_query!(
    EditorContent,
    Images,
    Users,
);
