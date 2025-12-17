import { FunctionComponent } from 'react';
import styles from './Container.module.css';


const Container:FunctionComponent = () => {
  	return (
    		<div className={styles.container}>
      			<div className={styles.glasswelcomecarddark}>
        				<div className={styles.container2} />
        				<div className={styles.container3} />
        				<div className={styles.container4} />
        				<div className={styles.container5}>
          					<div className={styles.container6}>
            						<div className={styles.heading2}>
              							<div className={styles.goodAfternoonTosin}>Good afternoon, Tosin! Keep the momentum going 💪</div>
            						</div>
            						<div className={styles.paragraph}>
              							<div className={styles.everyApplicationBrings}>Every application brings you closer to success ✨</div>
            						</div>
          					</div>
          					<img className={styles.buttonIcon} alt="" />
        				</div>
      			</div>
      			<div className={styles.container7}>
        				<div className={styles.glassstatsgriddark}>
          					<div className={styles.glassmetriccarddark}>
            						<div className={styles.container8} />
            						<div className={styles.container9} />
            						<div className={styles.container10} />
            						<div className={styles.container11}>
              							<div className={styles.container12}>
                								<div className={styles.div}>100%</div>
              							</div>
              							<div className={styles.container13}>
                								<div className={styles.profileComplete}>Profile Complete</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.glassmetriccarddark2}>
            						<div className={styles.container14} />
            						<div className={styles.container15} />
            						<div className={styles.container10} />
            						<div className={styles.container11}>
              							<div className={styles.container12}>
                								<div className={styles.div}>0</div>
              							</div>
              							<div className={styles.container13}>
                								<div className={styles.profileComplete}>Urgent Deadlines</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.glassmetriccarddark3}>
            						<div className={styles.container20} />
            						<div className={styles.container21} />
            						<div className={styles.container10} />
            						<div className={styles.container11}>
              							<div className={styles.container12}>
                								<div className={styles.div}>5</div>
              							</div>
              							<div className={styles.container13}>
                								<div className={styles.profileComplete}>Program Matches</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.glassmetriccarddark4}>
            						<div className={styles.container26} />
            						<div className={styles.container27} />
            						<div className={styles.container28} />
            						<div className={styles.container11}>
              							<div className={styles.container12}>
                								<div className={styles.div}>Set</div>
              							</div>
              							<div className={styles.container13}>
                								<div className={styles.profileComplete}>Budget Status</div>
              							</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.glassactioncarddark}>
          					<div className={styles.container32} />
          					<div className={styles.container33} />
          					<div className={styles.container34} />
          					<div className={styles.container35}>
            						<img className={styles.containerIcon} alt="" />
            						<div className={styles.container36}>
              							<div className={styles.container37}>
                								<div className={styles.text}>
                  									<div className={styles.nextBestAction}>Next Best Action</div>
                								</div>
                								<div className={styles.container38} />
                								<div className={styles.text2}>
                  									<div className={styles.recommended}>Recommended</div>
                								</div>
              							</div>
              							<div className={styles.heading3}>
                								<div className={styles.continueBuildingYour}>Continue building your profile</div>
              							</div>
              							<div className={styles.paragraph2}>
                								<div className={styles.profileComplete}>Complete your profile to unlock more opportunities</div>
              							</div>
              							<div className={styles.button}>
                								<div className={styles.getStarted}>Get Started</div>
                								<img className={styles.icon} alt="" />
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default Container;
