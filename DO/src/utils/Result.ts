/**
 * Representa un estado de éxito con un valor encapsulado.
 * @template T El tipo del valor en caso de éxito.
 */
type Success<T> = {
    readonly tag: 'Success'; // Identificador para discriminar el tipo
    readonly value: T;
}

/**
 * Representa un estado de error con un valor encapsulado.
 * @template E El tipo del valor en caso de error.
 */
type Failure<E> = {
    readonly tag: 'Failure'; // Identificador para discriminar el tipo
    readonly error: E;
}

/**
 * Clase Result que encapsula el resultado de una operación, que puede ser éxito o error.
 * Utiliza programación genérica para el tipo de valor (T) y el tipo de error (E).
 *
 * @template T El tipo del valor en caso de éxito.
 * @template E El tipo del valor en caso de error.
 */
export class Result<T, E> {
    // La unión de los tipos internos define que una instancia de Result
    // será siempre un Success O un Failure.
    private readonly result: Success<T> | Failure<E>;

    // El constructor es privado para forzar el uso de los métodos estáticos .ok() y .fail()
    private constructor(result: Success<T> | Failure<E>) {
        this.result = result;
    }

    /**
     * Crea una instancia de Result en estado de éxito.
     * @param value El valor a encapsular.
     * @returns Una nueva instancia de Result con el valor de éxito.
     */
    public static ok<T, E>(value: T): Result<T, E> {
        return new Result<T, E>({ tag: 'Success', value });
    }

    /**
     * Crea una instancia de Result en estado de error.
     * @param error El error a encapsular.
     * @returns Una nueva instancia de Result con el error.
     */
    public static fail<T, E>(error: E): Result<T, E> {
        return new Result<T, E>({ tag: 'Failure', error });
    }

    /**
     * Verifica si el Result está en estado de éxito.
     * @returns True si es éxito, false si es error.
     */
    public isSuccess(): this is Result<T, never> {
        return this.result.tag === 'Success';
    }

    /**
     * Verifica si el Result está en estado de error.
     * @returns True si es error, false si es éxito.
     */
    public isFailure(): this is Result<never, E> {
        return this.result.tag === 'Failure';
    }

    /**
     * Obtiene el valor encapsulado si el Result está en estado de éxito.
     * Lanza un error si se llama en un Result de fallo.
     * Es preferible usar `isSuccess()` y luego acceder a `value`.
     * @returns El valor de éxito.
     */
    public getValue(): T {
        if (this.isFailure()) {
            throw new Error('No se puede obtener el valor de un Result en estado de fallo.');
        }
        return (this.result as Success<T>).value;
    }

    /**
     * Obtiene el error encapsulado si el Result está en estado de error.
     * Lanza un error si se llama en un Result de éxito.
     * Es preferible usar `isFailure()` y luego acceder a `error`.
     * @returns El error.
     */
    public getError(): E {
        if (this.isSuccess()) {
            throw new Error('No se puede obtener el error de un Result en estado de éxito.');
        }
        return (this.result as Failure<E>).error;
    }

}