type ServerActionSuccess<T> = T extends void
    ? { isSuccess: true }
    : { isSuccess: true; data: T };

type ServerActionError = {
    isSuccess: false;
    errorMessage: string;
};

export type ServerActionResponse<T = void> =
    | ServerActionSuccess<T>
    | ServerActionError;
