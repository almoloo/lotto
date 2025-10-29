import { useEffect, useState } from 'react';
import { CREATE_SESSION_TX, GET_ALL_SESSIONS } from '../lib/scripts';
import {
	useFlowMutate,
	useFlowQuery,
	useFlowCurrentUser,
} from '@onflow/react-sdk';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isSessionActive } from '../types/session';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	CalendarIcon,
	CalendarPlusIcon,
	LoaderIcon,
	ShieldXIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { redirect } from 'react-router';
import type { SessionInfo } from '@/types/session';

const formSchema = z.object({
	ticketPrice: z
		.string()
		.refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.1, {
			message:
				'Ticket price must be a number greater than or equal to 0.1',
		}),
	// endTime timestamp in seconds
	endTime: z.number().min(Date.now() / 1000, {
		message: 'End time must be a future timestamp',
	}),
});

export default function CreateLottoView() {
	const [userSessions, setUserSessions] = useState<SessionInfo[] | null>(
		null
	);
	const [loadingSessions, setLoadingSessions] = useState<boolean>(false);

	const { user } = useFlowCurrentUser();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			ticketPrice: '1.0',
			endTime: Math.floor(Date.now() / 1000) + 86400, // Default to 1 day from now
		},
	});

	const { mutateAsync, isPending, error } = useFlowMutate();

	const { data: sessions, refetch } = useFlowQuery({
		cadence: GET_ALL_SESSIONS(),
		args: (arg, t) => [arg(user?.addr ?? '', t.Address)],
	}) as {
		data: SessionInfo[] | null;
		refetch: () => void;
	};

	useEffect(() => {
		if (sessions && sessions.length > 0) {
			setUserSessions(sessions);
			setLoadingSessions(false);
		} else {
			refetch();
		}
	}, [sessions, refetch]);

	useEffect(() => {
		if (userSessions && userSessions.length > 1) {
			const activeSession = userSessions.find((session) =>
				isSessionActive(session)
			);

			if (activeSession) {
				redirect(`/sessions/${activeSession.sessionID}`);
			}
		}
	}, [userSessions]);

	async function handleSubmit(data: z.infer<typeof formSchema>) {
		console.log('Form Data:', data);
		try {
			const txId = await mutateAsync({
				cadence: CREATE_SESSION_TX(),
				args: (arg, t) => [
					arg(parseFloat(data.ticketPrice).toFixed(1), t.UFix64),
					arg(data.endTime.toFixed(1), t.UFix64),
				],
			});
			console.log('Transaction submitted with ID:', txId);
			toast.success('Lotto session created successfully!');

			setLoadingSessions(true);
			refetch();
		} catch (error) {
			console.error('Error creating session:', error);
			toast.error('Failed to create lotto session. Please try again.');
		}
	}

	return (
		<div className="flex flex-col gap-6 py-10 relative">
			{loadingSessions && (
				<div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex items-center justify-center z-10 -mx-5">
					<div className="flex flex-col items-center">
						<LoaderIcon className="h-8 w-8 animate-spin mb-5" />
						<p className="text-lg font-medium max-w-[300px] text-center">
							You'll be redirected to your active session
							shortly...
						</p>
					</div>
				</div>
			)}

			<h1 className="font-bold text-2xl">Create New Lotto Session</h1>
			<p>
				Fill in the details below to create a new lottery session. Once
				created, participants can start buying tickets!
			</p>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<FieldGroup>
					<Controller
						name="ticketPrice"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="ticketPrice">
									Ticket Price (FLOW)
								</FieldLabel>
								<Input
									{...field}
									id="ticketPrice"
									data-invalid={fieldState.invalid}
									placeholder="1.0"
									autoComplete="off"
									disabled={isPending}
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<Controller
						name="endTime"
						control={form.control}
						render={({ field, fieldState }) => {
							const selectedDate = field.value
								? new Date(field.value * 1000)
								: undefined;

							const handleDateSelect = (
								date: Date | undefined
							) => {
								if (date) {
									const currentTime =
										selectedDate || new Date();
									date.setHours(currentTime.getHours());
									date.setMinutes(currentTime.getMinutes());
									field.onChange(
										Math.floor(date.getTime() / 1000)
									);
								}
							};

							const handleTimeChange = (
								type: 'hours' | 'minutes',
								value: string
							) => {
								const date = selectedDate || new Date();
								if (type === 'hours') {
									date.setHours(parseInt(value) || 0);
								} else {
									date.setMinutes(parseInt(value) || 0);
								}
								field.onChange(
									Math.floor(date.getTime() / 1000)
								);
							};

							return (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>End Time</FieldLabel>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal"
												disabled={isPending}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value
													? new Date(
															field.value * 1000
													  ).toLocaleString()
													: 'Pick a date and time'}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={selectedDate}
												onSelect={handleDateSelect}
												initialFocus
											/>
											<div className="border-t p-3">
												<Label className="text-sm font-medium mb-2 block">
													Time
												</Label>
												<div className="flex gap-2">
													<Input
														type="number"
														min="0"
														max="23"
														value={
															selectedDate?.getHours() ||
															0
														}
														onChange={(e) =>
															handleTimeChange(
																'hours',
																e.target.value
															)
														}
														className="w-20"
														placeholder="HH"
													/>
													<span className="self-center">
														:
													</span>
													<Input
														type="number"
														min="0"
														max="59"
														value={
															selectedDate?.getMinutes() ||
															0
														}
														onChange={(e) =>
															handleTimeChange(
																'minutes',
																e.target.value
															)
														}
														className="w-20"
														placeholder="MM"
													/>
												</div>
											</div>
										</PopoverContent>
									</Popover>
									{fieldState.invalid && (
										<FieldError
											errors={[fieldState.error]}
										/>
									)}
								</Field>
							);
						}}
					/>

					{error && (
						<Alert variant="destructive">
							<ShieldXIcon />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>
								{error.message ?? 'Unknown error'}
							</AlertDescription>
						</Alert>
					)}

					<Field orientation="horizontal">
						<Button
							type="submit"
							variant="default"
							disabled={isPending}
							className="cursor-pointer"
						>
							{isPending ? (
								<LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<CalendarPlusIcon className="mr-2 h-4 w-4" />
							)}
							Create Lotto
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
}
