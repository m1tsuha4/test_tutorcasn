import { TRPCError } from "@trpc/server"

export const getError = (error: any, message?: string) => {
    if (error instanceof TRPCError) {
        if (error.code === "CLIENT_CLOSED_REQUEST") {
            throw new TRPCError({
                code: "CLIENT_CLOSED_REQUEST",
                message: message ? message : "-"
            })
        }
        if (error.code === "CONFLICT") {
            throw new TRPCError({
                code: "CONFLICT",
                message: message ? message : "-"
            })
        }
        if (error.code === "FORBIDDEN") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: message ? message : "-"
            })
        }
        if (error.code === "METHOD_NOT_SUPPORTED") {
            throw new TRPCError({
                code: "METHOD_NOT_SUPPORTED",
                message: message ? message : "-"
            })
        }
        if (error.code === "NOT_FOUND") {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: message ? message : "-"
            })
        }
        if (error.code === "NOT_IMPLEMENTED") {
            throw new TRPCError({
                code: "NOT_IMPLEMENTED",
                message: message ? message : "-"
            })
        }
        if (error.code === "PARSE_ERROR") {
            throw new TRPCError({
                code: "PARSE_ERROR",
                message: message ? message : "-"
            })
        }
        if (error.code === "PAYLOAD_TOO_LARGE") {
            throw new TRPCError({
                code: "PAYLOAD_TOO_LARGE",
                message: message ? message : "-"
            })
        }
        if (error.code === "PRECONDITION_FAILED") {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: message ? message : "-"
            })
        }
        if (error.code === "TIMEOUT") {
            throw new TRPCError({
                code: "TIMEOUT",
                message: message ? message : "-"
            })
        }
        if (error.code === "TOO_MANY_REQUESTS") {
            throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: message ? message : "-"
            })
        }
        if (error.code === "UNAUTHORIZED") {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: message ? message : "-"
            })
        }
        if (error.code === "UNPROCESSABLE_CONTENT") {
            throw new TRPCError({
                code: "UNPROCESSABLE_CONTENT",
                message: message ? message : "-"
            })
        }
        if (error.code === "BAD_REQUEST") {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: message ? message : "-"
            })
        }
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        })
    }
}