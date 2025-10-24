import { ServerError } from "@/common/errors";
import {
	type AsyncResult,
	resultError,
	resultSuccess,
} from "@/common/types/utility";
import type { RdbClient } from "@/infrastructure/rdb";
import type { UserCommandRepository } from "../repository";
import type { User } from "../schema/userSchema";

export class UserCommandRepositoryImpl implements UserCommandRepository {
	constructor(private readonly db: RdbClient) {}

	async create(data: { supabaseId: string }): AsyncResult<User, Error> {
		try {
			const user = await this.db.user.create({
				data: {
					supabaseId: data.supabaseId,
				},
			});

			return resultSuccess({
				userId: user.userId,
				supabaseId: user.supabaseId,
				createdAt: user.createdAt,
			});
		} catch (error) {
			return resultError(new ServerError(error));
		}
	}
}
