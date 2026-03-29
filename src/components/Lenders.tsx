import rocket from "../assets/rocket-mortgage.png";
import amerisave from "../assets/amerisave.svg";
import loandepot from "../assets/loandepot.png";
import magnolia from "../assets/magnolia.png";
import federal from "../assets/federal.svg";
import prosperity from "../assets/prosperity.png";
import Marquee from "react-fast-marquee";

const logos = [
	{
		name: "Rocket Mortgage",
		src: rocket,
		width: 240,
		height: 60,
	},
	{
		name: "Amerisave Mortgage",
		src: amerisave,
		width: 240,
		height: 60,
	},
	{
		name: "Loan Depot",
		src: loandepot,
		width: 240,
		height: 60,
	},
	{
		name: "Magnolia Bank Loans",
		src: magnolia,
		width: 140,
		height: 60,
	},
	{
		name: "Federal Savings",
		src: federal,
		width: 240,
		height: 80,
	},
	{
		name: "Prosperity Home Mortgage",
		src: prosperity,
		width: 240,
		height: 60,
	},
];
const Lenders = () => {
	return (
		<section className='py-12 bg-muted/30'>
			<div className='container mx-auto px-4'>
				<div className='flex flex-col items-center'>
					<h2 className='text-lg md:text-xl font-bold uppercase text-center mb-8 text-muted-foreground tracking-wider'>
				PARTICIPATING LENDERS
			</h2>

					<div className='w-full overflow-hidden'>
			<Marquee
							className={"w-full py-6"}
							gradient={true}
							gradientColor="rgb(248, 250, 252)"
							gradientWidth={100}
							speed={50}
				style={{ whiteSpace: "nowrap" }}
				loop={0}
							pauseOnHover={true}
			>
				{logos.map((item: any) => {
					return (
									<div
										key={item.name}
										className='flex items-center justify-center mx-8 h-16 opacity-70 hover:opacity-100 transition-opacity duration-300'
									>
						<img
							src={item.src}
							alt={item.name}
							style={{
								width: item.width,
								height: item.height,
												objectFit: "contain",
							}}
						/>
									</div>
					);
				})}
			</Marquee>
		</div>
				</div>
			</div>
		</section>
	);
};

export default Lenders;
