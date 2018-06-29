#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>


#import <Firebase.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <BugsnagReactNative/BugsnagReactNative.h>
#import "ReactNativeConfig.h"
#import "RNFirebaseNotifications.h"
#import "RNFirebaseMessaging.h"
#import <React/RCTLinkingManager.h>
#import "RNFirebaseLinks.h"
#import <FirebaseDynamicLinks/FirebaseDynamicLinks.h>

@import GoogleMaps;
// **********************************************
// *** DON'T MISS: THE NEXT LINE IS IMPORTANT ***
// **********************************************
#import "RCCManager.h"

// IMPORTANT: if you're getting an Xcode error that RCCManager.h isn't found, you've probably ran "npm install"
// with npm ver 2. You'll need to "npm install" with npm 3 (see https://github.com/wix/react-native-navigation/issues/1)

#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
#ifdef DEBUG
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
#else
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
  
  for (NSString* family in [UIFont familyNames])
  {
    NSLog(@"%@", family);
    for (NSString* name in [UIFont fontNamesForFamilyName: family])
    {
      NSLog(@" %@", name);
    }
  }
  
  [GMSServices provideAPIKey:[ReactNativeConfig envFor:@"GOOGLE_MAPS_API_KEY"]];
  
  
  // **********************************************
  // *** DON'T MISS: THIS IS HOW WE BOOTSTRAP *****
  // **********************************************
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [[RCCManager sharedInstance] initBridgeWithBundleURL:jsCodeLocation launchOptions:launchOptions];
  
  /*
   // original RN bootstrap - remove this part
   RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
   moduleName:@"example"
   initialProperties:nil
   launchOptions:launchOptions];
   self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
   UIViewController *rootViewController = [UIViewController new];
   rootViewController.view = rootView;
   self.window.rootViewController = rootViewController;
   [self.window makeKeyAndVisible];
   */
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
  
//  if ([ReactNativeConfig envFor:@"WITH_BUGSNAG"]) {
    [BugsnagReactNative start];
//  }
  
  if ([ReactNativeConfig envFor:@"WITH_NOTIFICATIONS"]) {
    [FIROptions defaultOptions].deepLinkURLScheme = @"goodshlocal";
    //[[[NSBundle mainBundle] infoDictionary] valueForKey:@"DYNAMIC_LINK_PROTOCOL_SCHEME"];
    [FIRApp configure];
    [RNFirebaseNotifications configure];
  }
  
  if ([ReactNativeConfig envFor:@"WITH_FABRIC"]) {
    [Fabric with:@[[Answers class], [Crashlytics class]]];
  }

  [FIRDynamicLinks performDiagnosticsWithCompletion:nil];
  
  return YES;
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  BOOL handled = [[FBSDKApplicationDelegate sharedInstance] application:application
                                                                openURL:url
                                                      sourceApplication: options[UIApplicationOpenURLOptionsSourceApplicationKey] annotation: options[UIApplicationOpenURLOptionsAnnotationKey]];

  if (!handled) {
      handled = [RCTLinkingManager
                 application:application
                 openURL:url
                 sourceApplication: options[UIApplicationOpenURLOptionsSourceApplicationKey]
                 annotation: options[UIApplicationOpenURLOptionsAnnotationKey]];
    }
  if (!handled) {
    handled = [[RNFirebaseLinks instance] application:application openURL:url options:options];
  }
  
  return handled;
}

- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
                                                       fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [FBSDKAppEvents activateApp];
}

- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  NSString *token = [[deviceToken description] stringByTrimmingCharactersInSet: [NSCharacterSet characterSetWithCharactersInString:@"<>"]];
  token = [token stringByReplacingOccurrencesOfString:@" " withString:@""];
  NSLog(@"content---%@", token);
}

//- (BOOL)application:(UIApplication *)application
//            openURL:(NSURL *)url
//            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
//{
//  return [RCTLinkingManager application:application openURL:url options:options];
//}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  BOOL handled = [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
  if (!handled) {
    handled = [[RNFirebaseLinks instance] application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  }
  return handled;
}

@end

