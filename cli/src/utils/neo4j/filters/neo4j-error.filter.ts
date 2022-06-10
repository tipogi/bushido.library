import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { Neo4jError } from 'neo4j-driver';

// NOTE: When we add the interceptor it does not catch Neo4jErrorFlter errors
// even we add in the service that decorator or in the controller
// Without interceptor it works the error

@Catch(Neo4jError)
/**
 * A class that model the errors that throws neo4j
 */
export class Neo4jErrorFilter implements ExceptionFilter {
    catch(exception: Neo4jError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let statusCode = 500
        let error = 'Internal Server Error'
        let message: string[] = []

        console.log('Neo4j Error Filter: ', exception.message)

        // Neo.ClientError.Schema.ConstraintValidationFailed
        // Node(54776) already exists with label `User` and property `email` = 'duplicate@email.com'
        if ( exception.message.includes('already exists with') ) {
            statusCode = 400
            error = 'Bad Request'

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [ _, property ] = exception.message.match(/`([a-z0-9]+)`/gi)
            message = [`${property.replace(/`/g, '')} already taken`]
        }
        // Neo.ClientError.Schema.ConstraintValidationFailed
        // Node(54778) with label `Test` must have the property `mustExist`
        else if ( exception.message.includes('must have the property') ) {
            statusCode = 400
            error = 'Bad Request'

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [ _, property ] = exception.message.match(/`([a-z0-9]+)`/gi)
            message = [`${property.replace(/`/g, '')} should not be empty`]
        } else if (exception.message.includes('connect ECONNREFUSED')) {
            console.log(exception)
            statusCode = 505
            error = 'Internal services unreacheable'
        }
        //console.log(exception)

        response
            .status(statusCode)
            .json({
                statusCode,
                message,
                error,
            }
        );
    }
}