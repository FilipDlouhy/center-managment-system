interface MenuItem {
  name: string;
  current: boolean;
  title: string;
}
const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");

export const NavigationBar = ({
  navigation,
  handleNavItemClick,
}: {
  navigation: MenuItem[];
  handleNavItemClick: (itemName: string) => void;
}) => (
  <div className="ml-10 flex items-baseline space-x-4">
    {navigation.map((item) => (
      <button
        key={item.name}
        onClick={() => handleNavItemClick(item.name)}
        className={classNames(
          item.current
            ? "bg-indigo-700 text-white"
            : "text-white hover:bg-indigo-500 hover:bg-opacity-75",
          "rounded-md px-3 py-2 text-sm font-medium"
        )}
        aria-current={item.current ? "page" : undefined}
      >
        {item.name}
      </button>
    ))}
  </div>
);
